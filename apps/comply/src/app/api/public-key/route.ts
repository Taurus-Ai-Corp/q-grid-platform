import { NextResponse } from 'next/server'
import { sha256 } from '@noble/hashes/sha2'
import { bytesToHex } from '@noble/hashes/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const publicKeyHex = process.env['PLATFORM_PQC_PUBLIC_KEY']

  if (!publicKeyHex) {
    return NextResponse.json(
      {
        error: 'platform_public_key_not_configured',
        message:
          'PLATFORM_PQC_PUBLIC_KEY is not set on this deployment. Evidence verification is unavailable.',
      },
      { status: 503 },
    )
  }

  let publicKey: Uint8Array
  try {
    publicKey = Uint8Array.from(Buffer.from(publicKeyHex, 'hex'))
  } catch {
    return NextResponse.json(
      { error: 'platform_public_key_invalid', message: 'Configured key is not valid hex.' },
      { status: 500 },
    )
  }

  const fingerprint = bytesToHex(sha256(publicKey))
  const keyId = process.env['PLATFORM_PQC_KEY_ID'] ?? 'comply-platform-v1'
  const issuedAt = process.env['PLATFORM_PQC_ISSUED_AT'] ?? null

  return NextResponse.json(
    {
      algorithm: 'ML-DSA-65',
      standard: 'NIST FIPS 204',
      keyId,
      issuedBy: 'GRIDERA|Comply',
      issuedAt,
      publicKey: publicKeyHex,
      publicKeyLength: publicKey.length,
      fingerprint,
      verifierLibrary: '@noble/post-quantum (ml_dsa65)',
      verifyAt: '/verify',
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, must-revalidate',
        'Content-Type': 'application/json',
        'X-Verifier-Url': '/verify',
      },
    },
  )
}
