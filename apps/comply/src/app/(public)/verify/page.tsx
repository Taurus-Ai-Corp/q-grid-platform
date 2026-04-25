import type { Metadata } from 'next'
import { Verifier } from './Verifier'

export const metadata: Metadata = {
  title: 'Verify Evidence Pack | GRIDERA|Comply',
  description:
    'Independently verify the ML-DSA-65 signature and Hiero HCS anchor of a GRIDERA|Comply evidence pack. Verification runs entirely in your browser — no data is uploaded.',
}

export default function VerifyPage() {
  return (
    <div className="max-w-[900px] mx-auto px-6 pt-16 pb-24">
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Verify an evidence pack</h1>
        <p className="text-lg text-muted-foreground">
          Paste a GRIDERA|Comply evidence pack below. Your browser will fetch our
          published{' '}
          <a href="/api/public-key" className="underline">
            ML-DSA-65 public key
          </a>{' '}
          and verify the signature locally. No pack data is uploaded to our servers.
        </p>
      </header>

      <Verifier />

      <section className="mt-16 space-y-8 text-sm">
        <div>
          <h2 className="text-2xl font-bold mb-3">What this checks</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Signature integrity.</strong> The pack&apos;s{' '}
              <code>signature</code> is verified against its <code>hash</code> using
              ML-DSA-65 (NIST FIPS 204) and the embedded <code>publicKey</code>. This
              proves the pack was signed by whoever holds the matching secret key.
            </li>
            <li>
              <strong>Origin.</strong> The pack&apos;s embedded <code>publicKey</code>{' '}
              must match the public key published at{' '}
              <a href="/api/public-key" className="underline">
                <code>/api/public-key</code>
              </a>
              . If it doesn&apos;t, the pack was signed by a different issuer.
            </li>
            <li>
              <strong>Anchor (optional).</strong> If the pack includes{' '}
              <code>hederaTopicId</code> and <code>hederaTxId</code>, you&apos;ll get a
              link to look up the anchor on{' '}
              <a
                href="https://hashscan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                HashScan
              </a>{' '}
              and confirm the hash was committed to the Hiero ledger.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-3">Pack format</h2>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
{`{
  "hash":         "<sha256-hex of the original payload>",
  "signature":    "<ml-dsa-65 signature, hex>",
  "publicKey":    "<ml-dsa-65 public key, hex>",
  "algorithm":    "ML-DSA-65",
  "timestamp":    1714000000000,
  "hederaTopicId": "0.0.xxxxxx",                              // optional
  "hederaTxId":    "0.0.xxxxxx@<seconds>.<nanos>",            // optional
  "hederaSequence": 42                                        // optional
}`}
          </pre>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-3">Verify offline</h2>
          <p className="text-muted-foreground">
            The verifier in this page is plain JavaScript and uses the audited{' '}
            <a
              href="https://github.com/paulmillr/noble-post-quantum"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              @noble/post-quantum
            </a>{' '}
            library. You can run the same check from your own machine with any
            ML-DSA-65 implementation — the algorithm is{' '}
            <a
              href="https://csrc.nist.gov/pubs/fips/204/final"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              NIST FIPS 204
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
