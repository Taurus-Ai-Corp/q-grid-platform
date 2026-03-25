import { Client, PrivateKey } from '@hashgraph/sdk'
import type { HederaConfig } from './config.js'

export function createHederaClient(config: HederaConfig): Client {
  let client: Client
  switch (config.network) {
    case 'mainnet':
      client = Client.forMainnet()
      break
    case 'previewnet':
      client = Client.forPreviewnet()
      break
    case 'testnet':
    default:
      client = Client.forTestnet()
      break
  }
  client.setOperator(config.operatorId, PrivateKey.fromString(config.operatorKey))
  return client
}
