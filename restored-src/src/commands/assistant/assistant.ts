/**
 * Stub: Assistant command - install wizard and helpers.
 * Not recovered from sourcemap.
 */

import React from 'react'
import { Box, Text } from '../../ink.js'

interface NewInstallWizardProps {
  defaultDir: string
  onInstalled: (dir: string) => void
  onCancel: () => void
  onError: (message: string) => void
}

export function NewInstallWizard({
  onCancel,
}: NewInstallWizardProps): React.ReactElement {
  // Stub: immediately cancel
  React.useEffect(() => {
    onCancel()
  }, [onCancel])

  return React.createElement(Box, null, React.createElement(Text, null, 'NewInstallWizard stub'))
}

export async function computeDefaultInstallDir(): Promise<string> {
  return process.cwd()
}
