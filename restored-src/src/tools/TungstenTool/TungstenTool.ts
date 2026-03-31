/**
 * Stub: TungstenTool - Ant-internal terminal tool (Tmux-based).
 * Not recovered from sourcemap.
 */

import type { Tool } from '../../Tool.js'

export const TungstenTool: Tool = {
  name: 'Tungsten',
  description: 'Ant-internal terminal tool (stub)',
  async prompt() {
    return ''
  },
  isEnabled() {
    return false
  },
  isReadOnly() {
    return false
  },
  userFacingName() {
    return 'Tungsten'
  },
  renderToolUseMessage() {
    return null
  },
  renderToolResultMessage() {
    return null
  },
  async validateInput() {
    return { result: true }
  },
  async call() {
    return { type: 'text' as const, text: 'TungstenTool stub' }
  },
}

export function clearSessionsWithTungstenUsage(): void {}

export function resetInitializationState(): void {}
