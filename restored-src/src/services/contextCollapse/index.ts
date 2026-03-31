/**
 * Context collapse service stub.
 *
 * This module manages context window collapse — summarizing older conversation
 * spans to free token budget for new messages.
 */

import type { Message } from '../../query.js'

export type CollapseStats = {
  collapsedSpans: number
  stagedSpans: number
  health: {
    totalErrors: number
    totalEmptySpawns: number
    emptySpawnWarningEmitted: boolean
  }
}

export type CollapseResult = {
  messages: Message[]
  committed: number
}

export type DrainResult = {
  messages: Message[]
  committed: number
}

type Listener = () => void

const listeners = new Set<Listener>()

let stats: CollapseStats = {
  collapsedSpans: 0,
  stagedSpans: 0,
  health: {
    totalErrors: 0,
    totalEmptySpawns: 0,
    emptySpawnWarningEmitted: false,
  },
}

let enabled = false

/** Subscribe to collapse state changes (for useSyncExternalStore) */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Get current collapse statistics */
export function getStats(): CollapseStats {
  return stats
}

/** Check if context collapse is enabled */
export function isContextCollapseEnabled(): boolean {
  return enabled
}

/** Initialize context collapse */
export function initContextCollapse(): void {
  enabled = true
}

/** Reset context collapse state */
export function resetContextCollapse(): void {
  stats = {
    collapsedSpans: 0,
    stagedSpans: 0,
    health: {
      totalErrors: 0,
      totalEmptySpawns: 0,
      emptySpawnWarningEmitted: false,
    },
  }
  for (const listener of listeners) {
    listener()
  }
}

/** Apply collapses if needed before sending messages to API */
export async function applyCollapsesIfNeeded(
  messages: Message[],
  _toolUseContext: unknown,
  _querySource: string,
): Promise<CollapseResult> {
  return { messages, committed: 0 }
}

/** Check if a withheld prompt is too long */
export function isWithheldPromptTooLong(
  _message: unknown,
  _isPromptTooLong: boolean,
  _querySource: string,
): boolean {
  return false
}

/** Recover from overflow by draining staged collapses */
export function recoverFromOverflow(
  messages: Message[],
  _querySource: string,
): DrainResult {
  return { messages, committed: 0 }
}
