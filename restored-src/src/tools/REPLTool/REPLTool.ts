/**
 * Stub: REPLTool - Ant-internal REPL tool.
 * Not recovered from sourcemap.
 */

import type { Tool } from '../../Tool.js'

export const REPLTool: Tool = {
  name: 'REPL',
  description: 'Ant-internal REPL tool (stub)',
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
    return 'REPL'
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
    return { type: 'text' as const, text: 'REPLTool stub' }
  },
}
