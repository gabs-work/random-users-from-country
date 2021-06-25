import { AsyncAttempt, Attempt } from 'attempt-ts'
import * as nationalize from '../src/nationalize'

describe('nationalize.ts', () => {
  describe('sortCountriesByProbability', () => {
    it('should sort countries based on probability', () => {
      const countries = [
        { country_id: 'BR', probability: 0.2 },
        { country_id: 'CA', probability: 0.8 },
      ]
      const result = nationalize.sortCountriesByProbability(countries)

      expect(result).toEqual([
        { country_id: 'CA', probability: 0.8 },
        { country_id: 'BR', probability: 0.2 },
      ])
    })
  })
  describe('isNameValid', () => {
    it('should return true for valid name', () => {
      const name = 'Gabs'
      const result = nationalize.isNameValid(name)

      expect(result).toEqual(true)
    })
    it('should return false for invalid name', () => {
      const name = ''
      const result = nationalize.isNameValid(name)

      expect(result).toEqual(false)
    })
  })

  describe('getCountryForName', () => {
    it('should call client and return value on successful request', async () => {
      const mockClient = {
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
      const result = await AsyncAttempt(
        nationalize.getCountryForName(mockClient)('Gabs')
      )

      expect(mockClient.get).toHaveBeenCalledWith('?name=Gabs')
      expect(result).toBe('CA')
    })

    it('should throw error on invalid name', async () => {
      const mockClient = {
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
      try {
        await AsyncAttempt(nationalize.getCountryForName(mockClient)(''))
      } catch (err) {
        expect(err.status).toBe(400)
        expect(err.message).toBe(
          'The provided name is invalid. Please try with another name'
        )
        expect(err.name).toBe('nationalize')
      }
    })

    it('should throw error on empty list', async () => {
      const mockClient = {
        get: jest.fn().mockResolvedValue({
          data: { name: 'Gabs', country: [] },
          status: 200,
          statusText: 'OK',
        }),
      }
      try {
        await AsyncAttempt(nationalize.getCountryForName(mockClient)(''))
      } catch (err) {
        expect(err.status).toBe(400)
        expect(err.message).toBe(
          'The provided name is invalid. Please try with another name'
        )
        expect(err.name).toBe('nationalize')
      }
    })

    it('should throw error on unexpected client error', async () => {
      const mockClient = {
        get: jest.fn().mockImplementation(() => {
          throw 'unexpected'
        }),
      }
      try {
        await AsyncAttempt(nationalize.getCountryForName(mockClient)('Gabs'))
      } catch (err) {
        expect(err.status).toBe(500)
        expect(err.message).toBe('External API call failed')
        expect(err.name).toBe('axios')
      }
    })
  })

  describe('getFirstCountry', () => {
    it('should return the first element in a country array', () => {
      const countries = [
        { country_id: 'BR', probability: 0.2 },
        { country_id: 'CA', probability: 0.8 },
      ]

      const result = Attempt(
        nationalize.getFirstCountry({ name: '', country: countries })
      )
      expect(result).toEqual('CA')
    })
    it('should fail when unable to locate a country', () => {
      const countries = [
        { country_id: 'BR', probability: 0.2 },
        { country_id: 'CA', probability: 0.8 },
      ]

      try {
        Attempt(nationalize.getFirstCountry({ name: '', country: countries }))
      } catch (err) {
        expect(err.status).toBe(400)
        expect(err.message).toBe('Unable to locate a country for this name')
        expect(err.name).toBe('nationalize')
      }
    })
    it('should fail when there are no countries', () => {
      const countries = []

      try {
        Attempt(nationalize.getFirstCountry({ name: '', country: countries }))
      } catch (err) {
        expect(err.status).toBe(400)
        expect(err.message).toBe('Unable to locate a country for this name')
        expect(err.name).toBe('nationalize')
      }
    })
  })
})
