import * as sameCountry from '../src/same-country'
import { AsyncAttempt } from 'attempt-ts'
import nationalizeService from '../src/nationalize'
import randomUserService from '../src/random-user'
import resultFromAPI from './random-user.json'

describe('same-country.ts', () => {
  describe('getUsersFromSameCountryAsName', () => {
    it('Should call both APIs and return value', async () => {
      const mockNationalizeClient = {
        get: jest.fn().mockResolvedValue({
          data: {
            name: 'Gabs',
            country: [
              { country_id: 'BR', probability: 0.2 },
              { country_id: 'CA', probability: 0.8 },
            ],
          },
          status: 200,
          statusText: 'OK',
        }),
      }
      const mockRandomUserClient = {
        get: jest.fn().mockResolvedValue({
          data: resultFromAPI,
          status: 200,
          statusText: 'OK',
        }),
      }

      const ns = nationalizeService(mockNationalizeClient)
      const rs = randomUserService(mockRandomUserClient)

      const result = await AsyncAttempt(
        sameCountry.getUsersFromSameCountryAsName(ns, rs)('Gabs')
      )

      expect(mockNationalizeClient.get).toHaveBeenCalledTimes(1)
      expect(mockRandomUserClient.get).toHaveBeenCalledTimes(1)
      expect(result.users.length).toBe(50)
    })
    it('Should throw error message on expected format', async () => {
      const mockNationalizeClient = {
        get: jest.fn().mockResolvedValue({
          data: {
            name: 'Gabs',
            country: [],
          },
          status: 200,
          statusText: 'OK',
        }),
      }
      const mockRandomUserClient = {
        get: jest.fn().mockResolvedValue({
          data: resultFromAPI,
          status: 200,
          statusText: 'OK',
        }),
      }

      const ns = nationalizeService(mockNationalizeClient)
      const rs = randomUserService(mockRandomUserClient)

      try {
        await AsyncAttempt(
          sameCountry.getUsersFromSameCountryAsName(ns, rs)('Gabs')
        )
      } catch (err) {
        expect(err.error).toBe(true)
        expect(err.message).toBe(
          '[HTTP 500] [random-user] Received location is invalid'
        )
      }
    })
  })
})
