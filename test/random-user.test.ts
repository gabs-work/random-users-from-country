import { AsyncAttempt } from 'attempt-ts'
import * as randomUser from '../src/random-user'
import resultFromAPI from './random-user.json'

describe('random-user.ts', () => {
  describe('getFullName', () => {
    it('should return formatted name', () => {
      const name = { title: 'Mr', first: 'Gabs', last: 'Simon' }
      const result = randomUser.getFullName(name)

      expect(result).toBe('Gabs Simon')
    })
  })
  describe('convertUser', () => {
    it('should convert a user', () => {
      const name = { title: 'Mr', first: 'Gabs', last: 'Simon' }
      const preconvertUser = { name, email: 'gabs.simon@outlook.com', nat: 'CA' }

      const result = randomUser.convertUser(preconvertUser)

      expect(result).toEqual({
        name: 'Gabs Simon',
        email: 'gabs.simon@outlook.com',
      })
    })
  })
  describe('isValidLocation', () => {
    it('should return true for valid locations', () => {
      const location = 'CA'
      const listOfLocations = ['CA', 'BR']

      const result = randomUser.isValidLocation(listOfLocations)(location)
      expect(result).toBe(true)
    })
    it('should return false for invalid locations', () => {
      const location = 'US'
      const listOfLocations = ['CA', 'BR']

      const result = randomUser.isValidLocation(listOfLocations)(location)
      expect(result).toBe(false)
    })
  })
  describe('getListOfUsersByCountry', () => {
    it('should call client and return value on successful request', async () => {
      const mockClient = {
        get: jest.fn().mockResolvedValue({
          data: resultFromAPI,
          status: 200,
          statusText: 'OK',
        }),
      }
      const result = await AsyncAttempt(
        randomUser.getListOfUsersByCountry(mockClient)('CA')
      )

      expect(mockClient.get).toHaveBeenCalledWith(
        '?results=50&inc=email,name&nat=CA'
      )
      expect(result).toEqual(resultFromAPI.results.map(randomUser.convertUser))
    })

    it('should call client and throw error on failed request', async () => {
      const mockClient = {
        get: jest.fn().mockResolvedValue({
          data: { error: 'Not Found' },
          status: 404,
          statusText: 'Not Found',
        }),
      }
      try {
        await AsyncAttempt(randomUser.getListOfUsersByCountry(mockClient)('CA'))
      } catch (err) {
        expect(mockClient.get).toHaveBeenCalledWith(
          '?results=50&inc=email,name&nat=CA'
        )
        expect(err.status).toBe(500)
        expect(err.message).toBe('External API call returned failed result')
        expect(err.name).toBe('axios')
      }
    })

    it('should throw error on empty results', async () => {
      const mockClient = {
        get: jest.fn().mockResolvedValue({
          data: { results: [] },
          status: 200,
          statusText: 'OK',
        }),
      }
      try {
        await AsyncAttempt(randomUser.getListOfUsersByCountry(mockClient)('CA'))
      } catch (err) {
        expect(err.status).toBe(400)
        expect(err.message).toBe('API call returned no users')
        expect(err.name).toBe('random-user')
      }
    })

    it('should throw error on unexpected client error', async () => {
      const mockClient = {
        get: jest.fn().mockImplementation(() => {
          throw 'unexpected'
        }),
      }
      try {
        await AsyncAttempt(randomUser.getListOfUsersByCountry(mockClient)('CA'))
      } catch (err) {
        expect(err.status).toBe(500)
        expect(err.message).toBe('Unexpected Error')
        expect(err.name).toBe('axios')
      }
    })

    it('should throw error when location is invalid', async () => {
      const mockClient = {
        get: jest.fn().mockImplementation(() => {
          throw 'unexpected'
        }),
      }
      try {
        await AsyncAttempt(
          randomUser.getListOfUsersByCountry(mockClient, ['BR', 'CA'])('US')
        )
      } catch (err) {
        expect(err.status).toBe(500)
        expect(err.message).toBe(
          "Received location is invalid"
        )
        expect(err.name).toBe('random-user')
      }
    })
  })
})
