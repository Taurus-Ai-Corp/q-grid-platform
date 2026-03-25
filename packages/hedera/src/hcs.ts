import { TopicCreateTransaction, TopicMessageSubmitTransaction } from '@hashgraph/sdk'
import type { Client } from '@hashgraph/sdk'

/**
 * Submit a message to an existing HCS topic.
 * Returns the transaction ID string and the topic sequence number.
 */
export async function submitToHCS(
  client: Client,
  topicId: string,
  message: string,
): Promise<{ txId: string; sequence: number }> {
  const response = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(message)
    .execute(client)

  const receipt = await response.getReceipt(client)

  const txId = response.transactionId.toString()
  const sequence = receipt.topicSequenceNumber !== null
    ? Number(receipt.topicSequenceNumber)
    : 0

  return { txId, sequence }
}

/**
 * Create a new HCS topic and return its topic ID as a string (e.g. "0.0.12345").
 */
export async function createTopic(client: Client, memo?: string): Promise<string> {
  const tx = new TopicCreateTransaction()
  if (memo !== undefined) {
    tx.setTopicMemo(memo)
  }

  const response = await tx.execute(client)
  const receipt = await response.getReceipt(client)

  if (receipt.topicId === null) {
    throw new Error('TopicCreateTransaction succeeded but receipt contained no topicId')
  }

  return receipt.topicId.toString()
}
