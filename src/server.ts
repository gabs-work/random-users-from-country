import axios from 'axios'
import { Request, Response, Application } from 'express'
import { AsyncAttempt } from 'attempt-ts'

import config from './config.json'

import sameCountryService from './same-country'
import nationalizeService from './nationalize'
import randomUserService from './random-user'

import express = require('express')

// Express server
const server: Application = express()
const port = config.port

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

server.get('/same_country/:name', async (req: Request, res: Response) => {
  const name = req.params.name ?? ''
  try {
    const result = await AsyncAttempt(service.getUsersFromSameCountryAsName(name))
    res.json(result)
  } catch (err) {
    res.status(err.status || 500).json(err)
  }
})

server.listen(port, () => {
  console.log(`Ready and listening on port ${port}`)
})
