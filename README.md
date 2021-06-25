# Gabs' Submission

## Introduction

Greetings to the dev team at InvoiceSimple! I'm Gabs and this is my submission for the coding challenge.

## Assumptions

A few instructions were intentionally left unclear, which led me to make the following assumptions:

- All error cases will be returned by the server in the format `{ error: boolean, message: string, errorDetails: any }`.
- Since the RandomUser API is only able to generate users for a few specific countries, if a name does not belong to an available country, this is treated as an error.
- Any external API call lasting more than 1000ms is automatically considered as failed.

## Instructions

### Installing, testing and running

- `npm i -D` to install dependencies
- `npm test` to run tests
- `npm run serve` to build and start the express server
- `npm run start-azure` to build and run as an Azure Function (requires the Azure Function Core Tools)

### Online version

An online version, running on Azure Functions, can be found at https://gabs-invoicesimple-challenge.azurewebsites.net/same_country/Gabs
