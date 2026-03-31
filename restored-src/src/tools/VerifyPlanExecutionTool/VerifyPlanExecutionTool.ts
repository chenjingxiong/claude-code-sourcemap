/**
 * Stub: VerifyPlanExecutionTool - Ant-internal plan execution verification tool.
 * Not recovered from sourcemap.
 */

import type { Tool } from '../../Tool.js'

export const VerifyPlanExecutionTool: Tool = {
  name: 'VerifyPlanExecution',
  description: 'Ant-internal plan execution verification tool (stub)',
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
    return 'VerifyPlanExecution'
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
    return { type: 'text' as const, text: 'VerifyPlanExecutionTool stub' }
  },
}
