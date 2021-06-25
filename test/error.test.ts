import { Attempt } from 'attempt-ts'
import * as error from '../src/error'

describe('error.ts', () => {
  describe('SameCountryError constructor', () => {
    it('should correctly return an instance of SameCountryError', () => {
      const errorMessage = new error.SameCountryError(
        'Test message',
        'test',
        501
      )

      expect(errorMessage.message).toBe('Test message')
      expect(errorMessage.name).toBe('test')
      expect(errorMessage.status).toBe(501)
    })
  })

  describe('sameCountryFailure', () => {
    it('should correctly throw an instance of SameCountryFailure', () => {
      try {
        Attempt(error.SameCountryFailure('Test message', 'test', 501))
      } catch (err) {
        expect(err.message).toBe('Test message')
        expect(err.name).toBe('test')
        expect(err.status).toBe(501)
      }
    })
  })

  describe('formatErrorMessage', () => {
    it('should correctly format the error message', () => {
      const err = new error.SameCountryError('Test message', 'test', 501)
      const errorMessage = error.formatErrorMessage(err)

      expect(errorMessage).toBe('[HTTP 501] [test] Test message')
    })
  })
})
