'use client'

import { useState } from 'react'
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa'
import { sha256 } from '@noble/hashes/sha2'
import { bytesToHex } from '@noble/hashes/utils'

interface EvidencePack {
  hash: string
  signature: string
  publicKey: string
  algorithm: string
  timestamp: number
  hederaTopicId?: string
  hederaTxId?: string
  hederaSequence?: number
}

interface VerifyResult {
  parsed: EvidencePack | null
  signatureValid: boolean | null
  publicKeyMatchesPlatform: boolean | null
  platformPublicKey: string | null
  fingerprint: string | null
  errors: string[]
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, '').toLowerCase()
  if (clean.length % 2 !== 0) throw new Error('hex string must have even length')
  if (!/^[0-9a-f]*$/.test(clean)) throw new Error('hex string contains non-hex characters')
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

export function Verifier() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleVerify() {
    setBusy(true)
    setResult(null)

    const errors: string[] = []
    let parsed: EvidencePack | null = null
    let signatureValid: boolean | null = null
    let publicKeyMatchesPlatform: boolean | null = null
    let platformPublicKey: string | null = null
    let fingerprint: string | null = null

    try {
      parsed = JSON.parse(input) as EvidencePack
    } catch (e) {
      errors.push(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`)
    }

    if (parsed) {
      if (parsed.algorithm !== 'ML-DSA-65') {
        errors.push(`Unsupported algorithm: "${parsed.algorithm}". Expected "ML-DSA-65".`)
      }
      if (!parsed.hash || !parsed.signature || !parsed.publicKey) {
        errors.push('Pack is missing required fields: hash, signature, publicKey.')
      } else {
        try {
          const hashBytes = new TextEncoder().encode(parsed.hash)
          const sigBytes = hexToBytes(parsed.signature)
          const pkBytes = hexToBytes(parsed.publicKey)
          signatureValid = ml_dsa65.verify(pkBytes, hashBytes, sigBytes)
          fingerprint = bytesToHex(sha256(pkBytes))
        } catch (e) {
          errors.push(`Signature check threw: ${e instanceof Error ? e.message : String(e)}`)
          signatureValid = false
        }
      }

      try {
        const res = await fetch('/api/public-key', { cache: 'no-store' })
        if (res.ok) {
          const data = (await res.json()) as { publicKey?: string }
          platformPublicKey = data.publicKey ?? null
          if (platformPublicKey && parsed.publicKey) {
            publicKeyMatchesPlatform =
              platformPublicKey.toLowerCase() === parsed.publicKey.toLowerCase()
          }
        } else if (res.status === 503) {
          errors.push(
            'Platform public key is not configured on this deployment — origin check skipped.',
          )
        } else {
          errors.push(`Could not fetch platform public key (HTTP ${res.status}).`)
        }
      } catch (e) {
        errors.push(
          `Could not fetch platform public key: ${e instanceof Error ? e.message : String(e)}`,
        )
      }
    }

    setResult({
      parsed,
      signatureValid,
      publicKeyMatchesPlatform,
      platformPublicKey,
      fingerprint,
      errors,
    })
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='Paste evidence pack JSON, e.g. { "hash": "...", "signature": "...", "publicKey": "...", "algorithm": "ML-DSA-65", "timestamp": 1714000000000 }'
        spellCheck={false}
        className="w-full min-h-[240px] font-mono text-xs border rounded-md p-4 bg-background"
      />
      <div className="flex gap-3">
        <button
          onClick={handleVerify}
          disabled={busy || !input.trim()}
          className="px-6 py-3 bg-foreground text-background font-medium rounded-md disabled:opacity-50"
        >
          {busy ? 'Verifying…' : 'Verify'}
        </button>
        <button
          onClick={() => {
            setInput('')
            setResult(null)
          }}
          disabled={busy}
          className="px-6 py-3 border font-medium rounded-md disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      {result && <ResultDisplay result={result} />}
    </div>
  )
}

function ResultDisplay({ result }: { result: VerifyResult }) {
  const allPass =
    result.errors.length === 0 &&
    result.signatureValid === true &&
    result.publicKeyMatchesPlatform === true

  const partial =
    result.errors.length === 0 &&
    result.signatureValid === true &&
    result.publicKeyMatchesPlatform === null

  const headerClass = allPass
    ? 'border-green-600 bg-green-50 dark:bg-green-950/30'
    : partial
    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
    : 'border-red-600 bg-red-50 dark:bg-red-950/30'

  const headerLabel = allPass
    ? '✓ Verified'
    : partial
    ? '⚠ Signature valid, origin not checked'
    : '✗ Verification failed'

  return (
    <div className={`mt-8 border-2 rounded-md p-6 ${headerClass}`}>
      <h2 className="text-2xl font-bold mb-4">{headerLabel}</h2>

      <dl className="space-y-4 text-sm">
        <Row label="Signature (ML-DSA-65)" pass={result.signatureValid}>
          {result.signatureValid === true &&
            'Signature is valid for the embedded public key.'}
          {result.signatureValid === false && 'Signature does NOT verify.'}
          {result.signatureValid === null && 'Not checked.'}
        </Row>

        <Row label="Public key matches platform" pass={result.publicKeyMatchesPlatform}>
          {result.publicKeyMatchesPlatform === true &&
            'Embedded public key matches the key published by GRIDERA|Comply.'}
          {result.publicKeyMatchesPlatform === false && (
            <>
              Embedded key does NOT match platform key.{' '}
              <strong>The pack may be forged or from a different issuer.</strong>
            </>
          )}
          {result.publicKeyMatchesPlatform === null &&
            'Platform key not available — could not perform origin check.'}
        </Row>

        {result.fingerprint && (
          <div>
            <dt className="font-semibold">Pack public key fingerprint (sha256)</dt>
            <dd className="font-mono text-xs break-all mt-1">{result.fingerprint}</dd>
          </div>
        )}

        {result.parsed?.hederaTopicId && result.parsed?.hederaTxId && (
          <div>
            <dt className="font-semibold">Hiero HCS anchor</dt>
            <dd className="text-sm mt-1 space-y-1">
              <div>
                Topic <code>{result.parsed.hederaTopicId}</code>
              </div>
              <div className="break-all">
                Tx <code>{result.parsed.hederaTxId}</code>
              </div>
              <div>
                <a
                  href={`https://hashscan.io/mainnet/transaction/${encodeURIComponent(
                    result.parsed.hederaTxId,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Look up on HashScan (mainnet) ↗
                </a>
                {' · '}
                <a
                  href={`https://hashscan.io/testnet/transaction/${encodeURIComponent(
                    result.parsed.hederaTxId,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  testnet ↗
                </a>
              </div>
            </dd>
          </div>
        )}

        {result.parsed?.timestamp && (
          <div>
            <dt className="font-semibold">Pack timestamp</dt>
            <dd className="mt-1">{new Date(result.parsed.timestamp).toISOString()}</dd>
          </div>
        )}

        {result.errors.length > 0 && (
          <div>
            <dt className="font-semibold text-red-700 dark:text-red-400">Errors</dt>
            <dd className="mt-1">
              <ul className="list-disc list-inside text-red-700 dark:text-red-400 space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}

function Row({
  label,
  pass,
  children,
}: {
  label: string
  pass: boolean | null
  children: React.ReactNode
}) {
  const icon = pass === true ? '✓' : pass === false ? '✗' : '·'
  const color =
    pass === true
      ? 'text-green-700 dark:text-green-400'
      : pass === false
      ? 'text-red-700 dark:text-red-400'
      : 'text-gray-500'
  return (
    <div className="flex gap-3">
      <span className={`font-bold text-lg leading-none mt-0.5 ${color}`}>{icon}</span>
      <div>
        <dt className="font-semibold">{label}</dt>
        <dd className="text-muted-foreground">{children}</dd>
      </div>
    </div>
  )
}
