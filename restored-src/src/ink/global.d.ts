/**
 * Global type declarations for Ink renderer.
 */

// Extend JSX IntrinsicElements with Ink-specific element types
declare namespace JSX {
  interface IntrinsicElements {
    'ink-box': Record<string, unknown>
    'ink-text': Record<string, unknown>
    'ink-root': Record<string, unknown>
    'ink-virtual-text': Record<string, unknown>
  }
}
