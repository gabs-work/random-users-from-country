import axios from 'axios'
import { AsyncAttempt } from 'attempt-ts'
import { AzureFunction, Context, HttpRequest } from '@azure/functions'

import config from '../src/config.json'

import nationalizeService from '../src/nationalize'
import randomUserService from '../src/random-user'
import sameCountryService from '../src/same-country'

const nClient = axios.create({
  baseURL: config.nationalizeClientURL,
  timeout: 1000,
})

const rClient = axios.create({
  baseURL: config.randomUserClientURL,
  timeout: 1000,
})

// Pulled from the randomUser API since it can only generate users from these locations
const validLocations = config.validLocations

// SameCountryService with all clients injected
const service = sameCountryService(
  nationalizeService(nClient),
  randomUserService(rClient, validLocations)
)

// Azure Function Trigger
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const name = (req.query?.name || req.body?.name || req.params?.name || '');
  try {
    const result = await AsyncAttempt(service.getUsersFromSameCountryAsName(name))
    context.res.body = result
  } catch (err) {
    context.res = {
      status: err?.status || 500,
      body: err || { error: true, message: 'Unexpected error' },
    }
  }
}

export default httpTrigger
