import { AsyncAttempt, Failure, Success } from 'attempt-ts'
import { NationalizeService } from './nationalize'
import { RandomUserOutput, RandomUserService } from './random-user'
import { formatErrorMessage, SameCountryError } from './error'

import config from './config.json'

interface SameCountryOutput {
  nationality: string
  users: RandomUserOutput[]
}

export interface SameCountryErrorInterface {}

export interface SameCountryService {
  getUsersFromSameCountryAsName: (
    n: string
  ) => AsyncAttempt<SameCountryOutput, SameCountryErrorInterface>
}

// Main function that will be used both express server and lambda function
// Returns a result in the expected JSON format
export const getUsersFromSameCountryAsName =
  (nationalize: NationalizeService, randomUser: RandomUserService) =>
  async (
    name = ''
  ): AsyncAttempt<SameCountryOutput, SameCountryErrorInterface> => {
    try {
      let [country, users] = await Promise.all([
        AsyncAttempt(nationalize.getCountryForName(name)),
        AsyncAttempt(randomUser.getListOfUsersByCountry())
      ])

      // Filters users from the specified location
      if(country && country.length === 2){
        users = users.filter((c: RandomUserOutput) => c.nat === country)
        .slice(0, config.numberOfReturnedUsers)
      }

      return Success({nationality: country, users })

    } catch (err) {
      if (err instanceof SameCountryError) {
        return Failure({
          error: true,
          message: formatErrorMessage(err as SameCountryError),
          errorDetails: err,
        })
      }
      return Failure({
        error: true,
        message: 'Unexpected Error',
        errorDetails: err,
      })
    }
  }

const sameCountryService = (
  nationalize: NationalizeService,
  randomUser: RandomUserService
): SameCountryService => ({
  getUsersFromSameCountryAsName: getUsersFromSameCountryAsName(
    nationalize,
    randomUser
  ),
})

export default sameCountryService
