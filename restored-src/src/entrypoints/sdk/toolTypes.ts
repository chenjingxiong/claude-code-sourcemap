/**
 * Stub: SDK Tool Types - internal tool type definitions.
 * All marked @internal until SDK API stabilizes.
 * Not recovered from sourcemap.
 */

/** @internal */
export interface ToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

/** @internal */
export interface ToolResult {
  content: Array<{ type: string; text?: string }>
  isError?: boolean
}
