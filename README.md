# LaunchDarkly nodejs utils
Node functions wrapping LaunchDarkly API.  Note that this is not the sdk for implementing flags - it is the api to manage your account/flags.

## Why?
There does not appear to be a project currently providing a simple interface to manage flags in LaunchDarkly via API in nodejs.  

## How
There is a swagger.yaml available to generate bindings (https://launchdarkly.github.io/ld-openapi/swagger.yaml).  Uses the swagger-js module to generate a client, and adds some extra features around logging and input validation.

## Install
`npm install launchdarkly-nodeutils --save`

## Example usage
```
export LAUNCHDARKLY_API_TOKEN=<api-token>
npm run api getFlags <myProjectId>
```
TODO show usage in node app.
