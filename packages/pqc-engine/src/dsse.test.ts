import { generateKeyPair } from '@taurus/pqc-crypto'
import { describe, expect, it } from 'vitest'
import { generateCBOM } from './cbom.js'
import {
  akpPublicJwk,
  akpThumbprint,
  CBOM_PAYLOAD_TYPE,
  ML_DSA_65_COSE_ALG,
  ML_DSA_65_JOSE_ALG,
  pae,
  publicKeyFromAkpJwk,
  signCbomDsse,
  verifyCbomDsse,
} from './dsse.js'
import type { ScanResult } from './types.js'

const keys = () => generateKeyPair()

const scan = (): ScanResult => ({
  domain: 'example.com',
  scannedAt: '2026-01-01T00:00:00.000Z',
  tlsVersion: 'TLSv1.3',
  algorithms: [
    { name: 'RSA', keySize: 2048, grade: 'WEAK', vulnerable: true, severity: 'high' },
  ],
  certificates: [],
})

describe('pae — DSSE Pre-Authentication Encoding', () => {
  it('reproduces the test vector published in the DSSE protocol spec', () => {
    // Verbatim from secure-systems-lab/dsse protocol.md:
    //   DSSEv1 29 http://example.com/HelloWorld 11 hello world
    expect(Buffer.from(pae('http://example.com/HelloWorld', Buffer.from('hello world'))).toString()).toBe(
      'DSSEv1 29 http://example.com/HelloWorld 11 hello world',
    )
  })

  it('uses BYTE length, not character count, for multi-byte content', () => {
    // "é" is 2 bytes in UTF-8 but 1 JS character. Getting this wrong is the classic
    // PAE bug and silently breaks cross-implementation verification.
    const out = Buffer.from(pae('t', Buffer.from('é', 'utf8'))).toString()
    expect(out).toBe('DSSEv1 1 t 2 é')
  })

  it('is unambiguous across a shifted type/body split', () => {
    const a = Buffer.from(pae('ab', Buffer.from('cd'))).toString()
    const b = Buffer.from(pae('abc', Buffer.from('d'))).toString()
    expect(a).not.toBe(b)
  })
})

describe('RFC 9964 key representation', () => {
  it('emits an AKP public JWK with the registered algorithm name', () => {
    const { publicKey } = keys()
    const jwk = akpPublicJwk(publicKey)
    expect(jwk.kty).toBe('AKP')
    expect(jwk.alg).toBe('ML-DSA-65')
    expect(ML_DSA_65_JOSE_ALG).toBe('ML-DSA-65')
    expect(ML_DSA_65_COSE_ALG).toBe(-49)
    // base64url, unpadded, and round-trips to the 1952-byte ML-DSA-65 public key.
    expect(jwk.pub).not.toMatch(/[+/=]/)
    expect(publicKeyFromAkpJwk(jwk)).toEqual(publicKey)
  })

  it('refuses to treat a key carrying priv as public', () => {
    const { publicKey } = keys()
    expect(() => publicKeyFromAkpJwk({ ...akpPublicJwk(publicKey), priv: 'AAAA' })).toThrow(/priv/)
  })

  it('produces a stable thumbprint that changes with the key', () => {
    const a = keys()
    const b = keys()
    expect(akpThumbprint(a.publicKey)).toBe(akpThumbprint(a.publicKey))
    expect(akpThumbprint(a.publicKey)).not.toBe(akpThumbprint(b.publicKey))
    expect(akpThumbprint(a.publicKey)).not.toMatch(/[+/=]/) // base64url
  })
})

describe('signCbomDsse / verifyCbomDsse', () => {
  it('round-trips a signed CBOM', () => {
    const { secretKey, publicKey } = keys()
    const cbom = generateCBOM(scan(), { targetName: 'example.com' })
    const env = signCbomDsse(cbom, secretKey, publicKey)

    expect(env.payloadType).toBe(CBOM_PAYLOAD_TYPE)
    expect(env.signatures).toHaveLength(1)
    expect(env.signatures[0]?.keyid).toBe(akpThumbprint(publicKey))

    const res = verifyCbomDsse(env, publicKey)
    expect(res.ok).toBe(true)
    // The payload really is the CBOM, not an opaque blob.
    expect(JSON.parse(Buffer.from(res.payload!).toString()).bomFormat).toBe('CycloneDX')
  })

  it('rejects a tampered payload', () => {
    const { secretKey, publicKey } = keys()
    const env = signCbomDsse(generateCBOM(scan(), { targetName: 'example.com' }), secretKey, publicKey)

    const doc = JSON.parse(Buffer.from(env.payload, 'base64').toString())
    doc.metadata = { ...doc.metadata, tampered: true }
    env.payload = Buffer.from(JSON.stringify(doc)).toString('base64')

    expect(verifyCbomDsse(env, publicKey)).toMatchObject({ ok: false, reason: 'bad-signature' })
  })

  it('rejects a signature made by a different key rather than trying them all', () => {
    const signer = keys()
    const attacker = keys()
    const env = signCbomDsse(generateCBOM(scan(), { targetName: 'example.com' }), attacker.secretKey, attacker.publicKey)
    // Envelope is internally valid, but not signed by the key we trust.
    expect(verifyCbomDsse(env, attacker.publicKey).ok).toBe(true)
    expect(verifyCbomDsse(env, signer.publicKey)).toMatchObject({ ok: false, reason: 'keyid-mismatch' })
  })

  it('rejects a keyid spoofed onto a foreign signature', () => {
    const signer = keys()
    const attacker = keys()
    const env = signCbomDsse(generateCBOM(scan(), { targetName: 'example.com' }), attacker.secretKey, attacker.publicKey)
    env.signatures[0]!.keyid = akpThumbprint(signer.publicKey) // claim to be the trusted signer
    expect(verifyCbomDsse(env, signer.publicKey)).toMatchObject({ ok: false, reason: 'bad-signature' })
  })

  it('rejects a wrong payloadType even when the signature is otherwise valid', () => {
    const { secretKey, publicKey } = keys()
    const env = signCbomDsse(generateCBOM(scan(), { targetName: 'example.com' }), secretKey, publicKey)
    env.payloadType = 'application/vnd.in-toto+json'
    expect(verifyCbomDsse(env, publicKey)).toMatchObject({ ok: false, reason: 'bad-payload-type' })
  })

  it('rejects malleable base64 that decodes to the same bytes', () => {
    const { secretKey, publicKey } = keys()
    const env = signCbomDsse(generateCBOM(scan(), { targetName: 'example.com' }), secretKey, publicKey)
    // Node's decoder drops whitespace, so this decodes identically and the signature
    // would still verify — but any consumer digesting the SERIALIZED envelope sees a
    // different artifact for a valid signature.
    const mutated = { ...env, payload: `${env.payload.slice(0, 8)}\n${env.payload.slice(8)}` }
    expect(verifyCbomDsse(mutated, publicKey)).toMatchObject({
      ok: false,
      reason: 'malformed-base64',
    })
  })

  it('rejects an envelope with no signatures', () => {
    const { secretKey, publicKey } = keys()
    const env = signCbomDsse(generateCBOM(scan(), { targetName: 'example.com' }), secretKey, publicKey)
    env.signatures = []
    expect(verifyCbomDsse(env, publicKey)).toMatchObject({ ok: false, reason: 'no-signatures' })
  })
})
