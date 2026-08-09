/**
 * Standards-conformant CBOM signing: DSSE envelope + RFC 9964 key representation.
 *
 * Why this exists alongside `signCBOM`
 * ------------------------------------
 * `signCBOM` emits a GRIDERA-shaped envelope (`{cbom, signature:{algorithm, publicKey,
 * value}}`). Nothing else in the ecosystem can read it. Two things changed that:
 *
 *  1. **RFC 9964** (Standards Track, May 2026) registers ML-DSA for JOSE and COSE:
 *     JOSE `alg` = "ML-DSA-65", COSE `alg` = -49, key type `AKP` with a REQUIRED `pub`
 *     parameter. A bespoke algorithm identifier is no longer defensible.
 *  2. **CycloneDX has no PQC option in its own JSF-0.82 signature block**, so a
 *     PQC-signed CBOM has to travel in a detached envelope regardless. DSSE is the
 *     envelope in-toto, SLSA and Sigstore already consume.
 *
 * So: sign the *same* canonical bytes, but wrap them the way the ecosystem will read.
 * When Sigstore's in-flight ML-DSA support lands, artifacts produced here are already
 * shaped for it instead of being orphaned in a private format.
 *
 * Specs implemented (values read from the primary sources, not from memory):
 *  - DSSE PAE — secure-systems-lab/dsse protocol.md
 *  - RFC 9964 §3, §6, §8.1.1.2, §8.1.4 — AKP key type, thumbprints, alg identifiers
 *  - RFC 7638 — JWK thumbprint
 */

import { createHash } from 'node:crypto'
import { sign, verify } from '@taurus/pqc-crypto'
import { canonicalBytes, type CycloneDXDocument } from './cbom.js'

/** Registered CycloneDX media type — the DSSE payloadType for a CBOM. */
export const CBOM_PAYLOAD_TYPE = 'application/vnd.cyclonedx+json'

/** RFC 9964 §8.1.4 JOSE algorithm name. COSE equivalent is -49 (§8.1.1.2). */
export const ML_DSA_65_JOSE_ALG = 'ML-DSA-65'
export const ML_DSA_65_COSE_ALG = -49

export interface DsseSignature {
  /** RFC 7638 JWK thumbprint of the AKP public key. */
  keyid: string
  /** base64 (standard) ML-DSA-65 signature over PAE(payloadType, body). */
  sig: string
}

export interface DsseEnvelope {
  /** base64 (standard) of SERIALIZED_BODY. */
  payload: string
  payloadType: string
  signatures: DsseSignature[]
}

/** RFC 9964 §3 public AKP JWK. `priv` MUST NOT appear in a public key. */
export interface AkpPublicJwk {
  kty: 'AKP'
  alg: string
  /** base64url, unpadded — RFC 9964 §3 requires base64url for JWK parameters. */
  pub: string
}

const b64 = (b: Uint8Array): string => Buffer.from(b).toString('base64')
const unb64 = (s: string): Uint8Array => new Uint8Array(Buffer.from(s, 'base64'))
const b64url = (b: Uint8Array): string => Buffer.from(b).toString('base64url')
const unb64url = (s: string): Uint8Array => new Uint8Array(Buffer.from(s, 'base64url'))

/**
 * DSSE Pre-Authentication Encoding.
 *
 *   PAE(type, body) = "DSSEv1" + SP + LEN(type) + SP + type + SP + LEN(body) + SP + body
 *
 * LEN is ASCII decimal with no leading zeros, and both lengths are BYTE lengths — not
 * character counts. That distinction is the whole point of PAE: it makes the encoding
 * unambiguous so a signature cannot be replayed against a different type/body split.
 */
export function pae(payloadType: string, body: Uint8Array): Uint8Array {
  const enc = new TextEncoder()
  const typeBytes = enc.encode(payloadType)
  const prefix = enc.encode(
    `DSSEv1 ${typeBytes.length} ${payloadType} ${body.length} `,
  )
  const out = new Uint8Array(prefix.length + body.length)
  out.set(prefix, 0)
  out.set(body, prefix.length)
  return out
}

/** RFC 9964 §3 — public AKP JWK for an ML-DSA-65 key. */
export function akpPublicJwk(publicKey: Uint8Array): AkpPublicJwk {
  return { kty: 'AKP', alg: ML_DSA_65_JOSE_ALG, pub: b64url(publicKey) }
}

/**
 * RFC 7638 JWK thumbprint, using the members RFC 9964 §6 makes required for AKP.
 *
 * §6 fixes their lexicographic order as alg, kty, pub — constructing the JSON in that
 * order by hand (rather than trusting object key order) is what makes the digest
 * reproducible across implementations.
 */
export function akpThumbprint(publicKey: Uint8Array): string {
  const jwk = akpPublicJwk(publicKey)
  const canonical = `{"alg":"${jwk.alg}","kty":"${jwk.kty}","pub":"${jwk.pub}"}`
  return createHash('sha256').update(Buffer.from(canonical, 'utf8')).digest('base64url')
}

/**
 * Sign a CBOM into a DSSE envelope.
 *
 * The signed bytes are `canonicalBytes(cbom)` — identical to what `signCBOM` and
 * `cbomSha256` use — so the Hedera-anchored digest still binds exactly the bytes that
 * were signed, and both envelope formats attest to the same artifact.
 */
export function signCbomDsse(
  cbom: CycloneDXDocument,
  secretKey: Uint8Array,
  publicKey: Uint8Array,
): DsseEnvelope {
  const body = canonicalBytes(cbom)
  const signature = sign(pae(CBOM_PAYLOAD_TYPE, body), secretKey)
  return {
    payload: b64(body),
    payloadType: CBOM_PAYLOAD_TYPE,
    signatures: [{ keyid: akpThumbprint(publicKey), sig: b64(signature) }],
  }
}

export interface DsseVerifyResult {
  ok: boolean
  /** Which check failed first — for actionable CI output rather than a bare false. */
  reason?: 'bad-payload-type' | 'no-signatures' | 'keyid-mismatch' | 'bad-signature'
  /** SERIALIZED_BODY, returned only when the signature verified. */
  payload?: Uint8Array
}

/**
 * Verify a DSSE-enveloped CBOM against a known public key.
 *
 * Accepts a signature only if its keyid matches the supplied key's thumbprint. A
 * verifier that ignores keyid and tries every signature will happily accept an envelope
 * signed by someone else entirely, which is the classic DSSE misuse.
 */
export function verifyCbomDsse(
  envelope: DsseEnvelope,
  publicKey: Uint8Array,
): DsseVerifyResult {
  if (envelope.payloadType !== CBOM_PAYLOAD_TYPE) return { ok: false, reason: 'bad-payload-type' }
  if (!envelope.signatures?.length) return { ok: false, reason: 'no-signatures' }

  const expected = akpThumbprint(publicKey)
  const match = envelope.signatures.find((s) => s.keyid === expected)
  if (!match) return { ok: false, reason: 'keyid-mismatch' }

  const body = unb64(envelope.payload)
  const ok = verify(pae(envelope.payloadType, body), unb64(match.sig), publicKey)
  return ok ? { ok: true, payload: body } : { ok: false, reason: 'bad-signature' }
}

/** Recover the ML-DSA public key bytes from an AKP JWK (rejects private keys). */
export function publicKeyFromAkpJwk(jwk: AkpPublicJwk & { priv?: string }): Uint8Array {
  if (jwk.kty !== 'AKP') throw new Error(`unsupported kty: ${jwk.kty}`)
  if (jwk.alg !== ML_DSA_65_JOSE_ALG) throw new Error(`unsupported alg: ${jwk.alg}`)
  if (jwk.priv !== undefined) throw new Error('priv MUST NOT be present in a public key')
  return unb64url(jwk.pub)
}
