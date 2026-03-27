/**
 * Singleton in-memory store for AI systems.
 * Shared across all route handlers in a single Next.js server process.
 * Swap for Neon DB queries when DATABASE_URL is provisioned.
 */

export interface SystemRecord {
  id: string
  name: string
  description: string
  deploymentScope: string
  useCase: string
  industry: string
  autonomyLevel: string
  riskLevel: string
  status: string
  jurisdiction: string
  createdAt: string
}

// Module-level singleton — persists for the lifetime of the server process
export const systemsStore = new Map<string, SystemRecord[]>()
