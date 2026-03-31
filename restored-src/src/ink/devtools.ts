/**
 * Stub: React devtools integration for Ink.
 * Conditionally imported in development mode only.
 * Not recovered from sourcemap.
 */

// This module is dynamically imported when NODE_ENV === 'development'
// and react-devtools-core is installed.
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const devtools = require('react-devtools-core')
  devtools.connectToDevTools()
} catch {
  // react-devtools-core not installed; silently skip
}
