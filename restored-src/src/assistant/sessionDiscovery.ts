/**
 * Stub: Assistant session discovery - find bridge sessions.
 * Not recovered from sourcemap.
 */

export interface AssistantSession {
  id: string
  name?: string
  cwd?: string
  lastActive?: number
}

export async function discoverAssistantSessions(): Promise<AssistantSession[]> {
  return []
}
