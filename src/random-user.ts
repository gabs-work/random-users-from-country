import { AsyncAttempt, Success, Failure } from 'attempt-ts'
import { Client, get } from './axios'
import { SameCountryError, SameCountryFailure } from './error'
import config from './config.json'

// Defines the interface for the exported RandomUser service
export interface RandomUserService {
  getListOfUsersByCountry: (
    country?: string,
    userCount?: number
  ) => AsyncAttempt<RandomUserOutput[], SameCountryError>
  isValidLocation: (name: string) => boolean
}

// Defines a name as expected from the RandomUser API
interface Name {
  title: string
  first: string
  last: string
}

// Defines a random user as expected from the RandomUser API
interface RandomUserInput {
  name: Name
  email: string
  nat: string
}

// Defines the expected output user format for the RandomUser service
export interface RandomUserOutput {
  name: string
  email: string
  nat: string
}

// Defines the expected format for data coming from the RandomUser API
interface Data {
  results: RandomUserInput[]
}

// Given a Name object, returns its full name
export const getFullName = (name: Name): string => `${name.first} ${name.last}`

// Converts each input line to an output line
export const convertUser = (i: RandomUserInput): RandomUserOutput => ({
  email: i.email,
  name: getFullName(i.name),
  nat: i.nat
})

// Checks if a given string is a valid location
export const isValidLocation =
  (validLocations = config.validLocations) =>
  (location = '') =>
    validLocations.includes(location)

// Fetches data from the RandomUser api
export const getListOfUsersByCountry =
  (client: Client, validLocations = config.validLocations) =>
  async (
    location = '',
    userCount = config.numberOfGeneratedUsers
  ): AsyncAttempt<RandomUserOutput[], SameCountryError> => {
    const users = await AsyncAttempt(
      get<Data>(client, `?results=${userCount}&inc=email,name,nat`)
    )

    if (users?.results.length == 0) {
      return SameCountryFailure(
        'API call returned no users',
        'random-user',
        400
      )
    }

    return Success(users.results.map(convertUser))
  }

// Returns the nationalize service for a client
const randomUser = (
  client: Client,
  validLocations = config.validLocations
): RandomUserService => ({
  getListOfUsersByCountry: getListOfUsersByCountry(client, validLocations),
  isValidLocation: isValidLocation(validLocations),
})

export default randomUser
