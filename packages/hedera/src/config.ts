export interface HederaConfig {
  network: 'mainnet' | 'testnet' | 'previewnet'
  operatorId: string
  operatorKey: string
  auditTopicId?: string
}

export function loadHederaConfig(): HederaConfig {
  const network = (process.env['HEDERA_NETWORK'] ?? 'testnet') as HederaConfig['network']
  const operatorId = process.env['HEDERA_OPERATOR_ID']
  const operatorKey = process.env['HEDERA_OPERATOR_KEY']
  if (!operatorId || !operatorKey) {
    throw new Error('HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY are required')
  }
  return {
    network,
    operatorId,
    operatorKey,
    auditTopicId: process.env['HEDERA_AUDIT_TOPIC_ID'],
  }
}
