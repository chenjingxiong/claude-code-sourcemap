/**
 * Stub: Snip compact - history snipping for context efficiency.
 * Not recovered from sourcemap.
 */

import type { Message } from '../../types/message.js'

export const SNIP_NUDGE_TEXT =
  'Context is getting large. Consider compacting the conversation.'

export function isSnipRuntimeEnabled(): boolean {
  return false
}

export function isSnipMarkerMessage(_message: unknown): boolean {
  return false
}

export function shouldNudgeForSnips(_messages: Message[]): boolean {
  return false
}

export function snipCompactIfNeeded(
  messages: Message[],
  _options?: { force?: boolean },
): { messages: Message[]; snipped: boolean } {
  return { messages, snipped: false }
}
