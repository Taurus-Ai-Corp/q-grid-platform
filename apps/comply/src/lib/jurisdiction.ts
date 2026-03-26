import { headers } from 'next/headers'
import { detectJurisdiction, getJurisdictionConfig } from '@taurus/jurisdiction'

export async function getServerJurisdiction() {
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost'
  const envOverride = process.env['JURISDICTION']
  const jurisdiction = detectJurisdiction(host, envOverride)
  const config = getJurisdictionConfig(jurisdiction)
  return { jurisdiction, config }
}
