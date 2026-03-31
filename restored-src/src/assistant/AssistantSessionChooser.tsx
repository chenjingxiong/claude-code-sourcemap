/**
 * Stub: AssistantSessionChooser - Pick a bridge session to attach to.
 * Not recovered from sourcemap.
 */

import React from 'react'
import { Box, Text } from '../ink.js'

export interface AssistantSession {
  id: string
  name?: string
}

interface AssistantSessionChooserProps {
  sessions: AssistantSession[]
  onSelect: (id: string) => void
  onCancel: () => void
}

export function AssistantSessionChooser({
  onCancel,
}: AssistantSessionChooserProps): React.ReactElement {
  // Stub: immediately cancel
  React.useEffect(() => {
    onCancel()
  }, [onCancel])

  return (
    <Box>
      <Text>AssistantSessionChooser stub</Text>
    </Box>
  )
}
