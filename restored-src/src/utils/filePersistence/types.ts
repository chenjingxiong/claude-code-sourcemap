/**
 * Types for file persistence module.
 */

/** Opaque branded type representing the turn start timestamp */
export type TurnStartTime = number & { readonly __brand: 'TurnStartTime' }

/** A file that was successfully persisted */
export type PersistedFile = {
  filename: string
  file_id: string
}

/** A file that failed to persist */
export type FailedPersistence = {
  filename: string
  error: string
}

/** Event data emitted after file persistence completes */
export type FilesPersistedEventData = {
  files: PersistedFile[]
  failed: FailedPersistence[]
}

/** Default concurrency for upload operations */
export const DEFAULT_UPLOAD_CONCURRENCY = 5

/** Maximum number of files that can be persisted in a single turn */
export const FILE_COUNT_LIMIT = 500

/** Subdirectory name for outputs within the session directory */
export const OUTPUTS_SUBDIR = 'outputs'
