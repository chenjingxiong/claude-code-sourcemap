/**
 * Stub: SDK Runtime Types - non-serializable types (callbacks, interfaces with methods).
 * Not recovered from sourcemap.
 */

import type { z } from 'zod/v4'
import type { SDKMessage, SDKResultMessage, SDKSessionInfo, SDKUserMessage } from './coreTypes.js'

// ============================================================================
// Effort
// ============================================================================

export type EffortLevel = 'low' | 'medium' | 'high' | 'max'

// ============================================================================
// Zod Utility Types
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyZodRawShape = Record<string, z.ZodType<any>>

export type InferShape<T extends AnyZodRawShape> = {
  [K in keyof T]: z.infer<T[K]>
}

// ============================================================================
// MCP Tool Definition
// ============================================================================

export interface SdkMcpToolDefinition<Schema extends AnyZodRawShape = AnyZodRawShape> {
  name: string
  description: string
  inputSchema: Schema
  handler: (args: InferShape<Schema>, extra: unknown) => Promise<unknown>
  annotations?: unknown
  searchHint?: string
  alwaysLoad?: boolean
}

export interface McpSdkServerConfigWithInstance {
  name: string
  version?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: Array<SdkMcpToolDefinition<any>>
  server: unknown
}

// ============================================================================
// Query Types
// ============================================================================

export interface Options {
  model?: string
  maxTurns?: number
  systemPrompt?: string
  appendSystemPrompt?: string
  allowedTools?: string[]
  disallowedTools?: string[]
  mcpServers?: Record<string, unknown>
  permissionMode?: string
  permissionPromptToolName?: string
  abortController?: AbortController
  cwd?: string
  continueConversation?: boolean
  resumeSessionId?: string
}

/** @internal */
export interface InternalOptions extends Options {
  _internal?: boolean
}

export interface Query extends AsyncIterable<SDKMessage> {
  result: Promise<SDKResultMessage>
  abort(): void
}

/** @internal */
export interface InternalQuery extends Query {
  _internal: true
}

// ============================================================================
// Session Types
// ============================================================================

export interface SDKSessionOptions {
  model?: string
  systemPrompt?: string
  appendSystemPrompt?: string
  allowedTools?: string[]
  disallowedTools?: string[]
  mcpServers?: Record<string, unknown>
  permissionMode?: string
  cwd?: string
  maxTurns?: number
}

export interface SDKSession {
  readonly sessionId: string
  send(
    message: string | AsyncIterable<SDKUserMessage>,
    options?: { maxTurns?: number },
  ): Query
  abort(): void
}

export type SessionMessage = SDKMessage

// ============================================================================
// Session Listing Types
// ============================================================================

export interface ListSessionsOptions {
  dir?: string
  limit?: number
  offset?: number
}

export interface GetSessionInfoOptions {
  dir?: string
}

export interface GetSessionMessagesOptions {
  dir?: string
  limit?: number
  offset?: number
  includeSystemMessages?: boolean
}

export interface SessionMutationOptions {
  dir?: string
}

export interface ForkSessionOptions {
  dir?: string
  title?: string
  cwd?: string
}

export interface ForkSessionResult {
  sessionId: string
}
