/**
 * Stub: SnapshotUpdateDialog - Agent memory snapshot update prompt.
 * Not recovered from sourcemap.
 */

import React from 'react'
import { Box, Text } from '../../ink.js'

interface SnapshotUpdateDialogProps {
  agentType: string
  scope: string
  snapshotTimestamp: string
  onComplete: (choice: 'merge' | 'keep' | 'replace') => void
  onCancel: () => void
}

export function SnapshotUpdateDialog({
  onComplete,
}: SnapshotUpdateDialogProps): React.ReactElement {
  // Stub: immediately resolve with 'keep'
  React.useEffect(() => {
    onComplete('keep')
  }, [onComplete])

  return (
    <Box>
      <Text>SnapshotUpdateDialog stub</Text>
    </Box>
  )
}
