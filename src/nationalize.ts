import { AsyncAttempt, Attempt, Success, Failure } from 'attempt-ts'
import { Client, get } from './axios'
import { SameCountryError, SameCountryFailure } from './error'

// Defines the exported nationalize service
export interface NationalizeService {
  getCountryForName: (name: string) => AsyncAttempt<string, SameCountryError>
}

// Defines a Country as expected from the Nationalize API
interface Country {
  country_id: string
  probability: number
}

// Defines the expected format for data from the Nationalize API
interface NationalizeData {
  name: string
  country: Country[]
}

// Sorts a list of countries by probability
export const sortCountriesByProbability = (countries: Country[]): Country[] =>
  countries.sort((a, b) => a.probability - b.probability)

// Checks if a given name is valid.
export const isNameValid = (name = ''): boolean => {
  return name.length > 0 ? true : false
}

// Returns the first country by probability from a given data
export const getFirstCountry = (
  data: NationalizeData
): Attempt<string, SameCountryError> =>
  data.country && data.country.length > 0
    ? Success(sortCountriesByProbability(data.country)[0].country_id)
    : SameCountryFailure(
        'Unable to locate a country for this name',
        'nationalize',
        400
      )

// Gets the most popular country for a given name
export const getCountryForName =
  (client: Client) =>
  async (name: string): AsyncAttempt<string, SameCountryError> => {
    try {
      if (!isNameValid(name)) {
        return SameCountryFailure(
          'The provided name is invalid. Please try with another name',
          'nationalize',
          400
        )
      }
      const countryList = await AsyncAttempt(
        get<NationalizeData>(client, `?name=${name}`)
      )
      const firstCountryID = Attempt(getFirstCountry(countryList))
      return Success(firstCountryID)
    } catch (err) {
      return err
    }
  }

// Returns the nationalize service for a client
const nationalize = (client: Client): NationalizeService => ({
  getCountryForName: getCountryForName(client),
})

export default nationalize
