/**
 * Stub: SuggestBackgroundPRTool - Ant-internal background PR suggestion tool.
 * Not recovered from sourcemap.
 */

import type { Tool } from '../../Tool.js'

export const SuggestBackgroundPRTool: Tool = {
  name: 'SuggestBackgroundPR',
  description: 'Ant-internal background PR suggestion tool (stub)',
  async prompt() {
    return ''
  },
  isEnabled() {
    return false
  },
  isReadOnly() {
    return true
  },
  userFacingName() {
    return 'SuggestBackgroundPR'
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
    return { type: 'text' as const, text: 'SuggestBackgroundPRTool stub' }
  },
}
