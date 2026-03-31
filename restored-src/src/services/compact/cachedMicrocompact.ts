/**
 * Stub: Cached microcompact - cached message compaction with cache edits.
 * Not recovered from sourcemap.
 */

import type { Message } from '../../types/message.js'

export interface CachedMCState {
  enabled: boolean
  pinnedEdits: PinnedCacheEdits[]
}

export interface CacheEditsBlock {
  type: 'cache_edits'
  edits: unknown[]
}

export interface PinnedCacheEdits {
  block: CacheEditsBlock
  pinnedAt: number
}

export interface CachedMCConfig {
  supportedModels: string[]
}

export function createCachedMCState(): CachedMCState {
  return { enabled: false, pinnedEdits: [] }
}

export function resetCachedMCState(_state: CachedMCState): void {}

export function isCachedMicrocompactEnabled(): boolean {
  return false
}

export function isModelSupportedForCacheEditing(_model: string): boolean {
  return false
}

export function getCachedMCConfig(): CachedMCConfig {
  return { supportedModels: [] }
}

export function createCacheEditsBlock(
  _state: CachedMCState,
  _toolsToDelete: unknown[],
): CacheEditsBlock {
  return { type: 'cache_edits', edits: [] }
}
