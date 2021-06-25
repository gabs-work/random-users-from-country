import { Failure } from 'attempt-ts'

// Defines a SameCountryError
export class SameCountryError extends Error {
  status: number // HTTP status code
  message: string // Error message
  name: string // Module/submodule name

  constructor(message: string, name: string, status: number) {
    super(message)
    this.status = status
    this.name = name
  }
}

// Default error function. Sets default values and returns an instance of Failure<SameCountryError>
export const SameCountryFailure = (
  message = 'Unexpected Error',
  name = 'core',
  status = 500
) => Failure(new SameCountryError(message, name, status))

// Formats an error message
export const formatErrorMessage = (err: SameCountryError) =>
  `[HTTP ${err.status}] [${err.name}] ${err.message}`
