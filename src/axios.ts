import { AsyncAttempt, Success } from 'attempt-ts'
import { SameCountryFailure, SameCountryError } from './error'

// Mockable version of a response type
export type Response<T = any> = MockableAxiosResponse<T>

// Mockable client interface
export interface Client {
  get: (s: string) => Promise<any>
}

// Mockable interface expected for Axios Responses
interface MockableAxiosResponse<T> {
  data: T
  status: number
  statusText: string
}

// Checks if a given Axios response is successful
export const isSuccessfulResponse = (res: Response): boolean => {
  return res.status < 400
}

// Extracts payload from an axios request
export const get = async <T = any>(
  client: Client,
  path: string
): AsyncAttempt<T, SameCountryError> => {
  let response: Response<T>
  try{
    response = await client.get(path)
  } catch(err) {
    return SameCountryFailure(
      'Unexpected Error',
      'axios',
      500
    )
  }
  if (!isSuccessfulResponse(response)) {
    return SameCountryFailure(
      'External API call returned failed result',
      'axios',
      500
    )
  }
  return Success(response.data)
}
