/**
 * Stub: ConnectorText types for internal connector text block handling.
 * Not recovered from sourcemap.
 */

export interface ConnectorTextBlock {
  type: 'connector_text'
  text: string
  connector_id?: string
}

export interface ConnectorTextDelta {
  type: 'connector_text_delta'
  text: string
}

export function isConnectorTextBlock(
  block: unknown,
): block is ConnectorTextBlock {
  return (
    typeof block === 'object' &&
    block !== null &&
    (block as ConnectorTextBlock).type === 'connector_text'
  )
}
