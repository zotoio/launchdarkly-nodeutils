# LaunchDarkly nodejs utils

[![npm version](https://badge.fury.io/js/launchdarkly-nodeutils.svg)](https://badge.fury.io/js/launchdarkly-nodeutils)
[![Build Status](https://travis-ci.org/wyvern8/launchdarkly-nodeutils.svg?branch=master)](https://travis-ci.org/wyvern8/launchdarkly-nodeutils)
[![Code Climate](https://img.shields.io/codeclimate/maintainability/wyvern8/launchdarkly-nodeutils.svg)](https://codeclimate.com/github/wyvern8/launchdarkly-nodeutils)
[![Test Coverage](https://codeclimate.com/github/wyvern8/launchdarkly-nodeutils/badges/coverage.svg)](https://codeclimate.com/github/wyvern8/launchdarkly-nodeutils/coverage)
[![Greenkeeper badge](https://badges.greenkeeper.io/wyvern8/launchdarkly-nodeutils.svg)](https://greenkeeper.io/)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?clear)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

LaunchDarkly (https://launchdarkly.com/) provides SaaS based Feature Flag management at scale, with SDKs for all major Languages.

This unofficial module provides NodeJs functions wrapping the LaunchDarkly API.  This is not the sdk for implementing flags in your app - it is the api to manage your account/flags.

## Why?
There does not appear to be a project currently providing a simple interface to manage flags in LaunchDarkly via API in nodejs.  

## How?
There is a swagger.yaml available to generate bindings (https://launchdarkly.github.io/ld-openapi/swagger.yaml).  Uses the swagger-js module to generate a client (https://github.com/swagger-api/swagger-js), and adds some extra features around logging and input validation.

## Install
`npm install launchdarkly-nodeutils --save`

## Example usage
Note that the api token is not the same as your sdk keys.  You need to generate this for your account in LaunchDarkly console.
```
export LAUNCHDARKLY_API_TOKEN=<api-token>
npm run api getFlags <myProjectId>
```
TODO show usage in node app..
