import { Attempt, AsyncAttempt } from 'attempt-ts'
import * as axios from '../src/axios'

describe('axios.ts', () => {
  describe('isSuccessfulResponse', () => {
    it('should return true for successful requests', () => {
      const successfulResponse = {
        data: { result: 'success' },
        status: 200,
        statusText: 'OK',
      }

      expect(axios.isSuccessfulResponse(successfulResponse)).toBe(true)
    })
    it('should return false for failed requests', () => {
      const notFoundResponse = {
        data: { error: true },
        status: 404,
        statusText: 'Not Found',
      }

      const serverErrorResponse = {
        data: { error: true },
        status: 500,
        statusText: 'Server error',
      }

      expect(axios.isSuccessfulResponse(notFoundResponse)).toBe(false)
      expect(axios.isSuccessfulResponse(serverErrorResponse)).toBe(false)
    })
  })
  
  describe('get', () => {
    it('should call client and return value on successful request', async () => {
      const mockClient = {
        get: jest.fn().mockResolvedValue({
          data: { result: 'success' },
          status: 200,
          statusText: 'OK',
        }),
      }
      const extractedData = await AsyncAttempt(axios.get(mockClient, ''))

      expect(mockClient.get).toHaveBeenCalledTimes(1)
      expect(extractedData).toEqual({ result: 'success' })
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
        await AsyncAttempt(axios.get(mockClient, ''))
      } catch (err) {
        expect(err.status).toBe(500)
        expect(err.message).toBe('External API call returned failed result')
        expect(err.name).toBe('axios')
      }
    })

    it('should call client and throw error on unexpected throw', async () => {
      const mockClient = {
        get: jest.fn().mockImplementation(() => {
          throw 'unexpected'
        }),
      }
      try {
        await AsyncAttempt(axios.get(mockClient, ''))
      } catch (err) {
        expect(err.status).toBe(500)
        expect(err.message).toBe('Unexpected Error')
        expect(err.name).toBe('axios')
      }
    })
  })
})
