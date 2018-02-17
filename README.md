# LaunchDarkly nodejs utils

[![npm version](https://badge.fury.io/js/launchdarkly-nodeutils.svg)](https://badge.fury.io/js/launchdarkly-nodeutils)
[![Build Status](https://travis-ci.org/wyvern8/launchdarkly-nodeutils.svg?branch=master)](https://travis-ci.org/wyvern8/launchdarkly-nodeutils)
[![Code Climate](https://img.shields.io/codeclimate/maintainability/wyvern8/launchdarkly-nodeutils.svg)](https://codeclimate.com/github/wyvern8/launchdarkly-nodeutils)
[![Test Coverage](https://codeclimate.com/github/wyvern8/launchdarkly-nodeutils/badges/coverage.svg)](https://codeclimate.com/github/wyvern8/launchdarkly-nodeutils/coverage)
[![Greenkeeper badge](https://badges.greenkeeper.io/wyvern8/launchdarkly-nodeutils.svg)](https://greenkeeper.io/)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?clear)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

LaunchDarkly (https://launchdarkly.com/) provides SaaS based Feature Flag management at scale, with SDKs for all major languages.

This unofficial module provides NodeJs functions wrapping the LaunchDarkly API.  This is not the sdk for implementing flags in your app - it is the api to manage your account/flags.

## Why?
There does not appear to be a project currently providing a simple interface to manage flags in LaunchDarkly via API in nodejs.  

## How?
There is a swagger.yaml available to generate bindings (https://launchdarkly.github.io/ld-openapi/swagger.yaml), so we use the swagger-js module to generate a client (https://github.com/swagger-api/swagger-js), and add some extra features around logging and chaining of operations.

## Install
1. `npm install launchdarkly-nodeutils --save`
2. Generate an access token with the permissions for the operations you will use. Please read: https://docs.launchdarkly.com/v2.0/docs/api-access-tokens

## Example usage
Please note that the api token is not the same as your sdk keys.  You need to generate this for your account in LaunchDarkly console as above, and set it as the LAUNCHDARKLY_API_TOKEN env var.

### commandline usage
After cloning this repo you can make `ldutils` executable, and use it to make api calls based on passed in parameters.

```
chmod 755 ./ldutils
./ldutils
```

The above will display a help screen of instructions, thanks to https://github.com/tj/commander.js/

Optionally you can add `ldutils` to your PATH:

```
# cloned repo
sudo ln -s /<clonepath>/launchdarkly-nodeutils/ldutils /usr/local/bin/ldutils

# or after 'npm install launchdarkly-nodeutils --save'
sudo ln -s /<installpath>/node_modules/launchdarkly-nodeutils/ldutils /usr/local/bin/ldutils
```
> Make sure you have env var LAUNCHDARKLY_API_TOKEN set, and if piping output to another command, ensure that LAUNCHDARKLY_API_LOGLEVEL is not set to 'debug' to ensure only the json result of the command is returned.

Here are some examples of commandline usage (if you have not added ldutils to PATH, prefix with `./`:
```
export LAUNCHDARKLY_API_TOKEN=<api-token>

// collect all flags for a project
ldutils getFeatureFlags <myProjectId>

// update or create a customRole with array of policies
ldutils upsertCustomRole <customRoleKey> <customRoleName> '[{"resources":["proj/*"],"actions":["*"],"effect":"allow"}]'
```

### node app usage
Assumes that you have set the LAUNCHDARKLY_API_TOKEN environment var.
```
let ldUtils = await new LaunchDarklyUtils().create(process.env.LAUNCHDARKLY_API_TOKEN);

// get flag state
let flagEnabled = await ldUtils.getFeatureFlagState('myProject', 'feature-abc', 'dev');

// update flag state to on=true
await ldUtils.toggleFeatureFlag('myProject', 'feature-def', 'dev', true);
```

## commandline modes and parameters
The command line modes and parameters map directly to the functions exposed for use in nodejs apps.  This info is also available using `ldutils -help`

### Feature flags

| Mode | parameters |
| ---- | ---------- |
| getFeatureFlags | projectKey |
| getFeatureFlag | projectKey, featureFlagKey, environmentKeyQuery |
| getFeatureFlagState | projectKey, featureFlagKey, environmentKeyQuery |
| updateFeatureFlag | projectKey, featureFlagKey, patchComment |
| toggleFeatureFlag | projectKey, featureFlagKey, environmentKeyQuery, enabled |
| migrateFeatureFlag | projectKey, featureFlagKey, fromEnv, toEnv, includeState |

- `migrateFeatureFlag` mode is used to copy flag attributes between environments.  This covers: targets, rules, fallthrough, offVariation, prerequisites and optionally the flag on/off state. eg. to migrate a flag from dev to test env.

```
ldutils migrateFeatureFlag my-project my-flag dev test
```

### Custom roles

| Mode | parameters |
| ---- | ---------- |
| getCustomRoles | none |
| getCustomRole | customRoleKey |
| getCustomRoleById | customRoleId |
| createCustomRole | customRoleKey, customRoleName, customRolePolicyArray, customRoleDescription(optional) |
| updateCustomRole | customRoleKey, customRoleName, customRolePolicyArray, customRoleDescription(optional) |
| upsertCustomRole | customRoleKey, customRoleName, customRolePolicyArray, customRoleDescription(optional) |
| bulkUpsertCustomRoles | roleBulkLoadFile |
| bulkUpsertCustomRoleFolder | roleFolder |

- `bulkUpsertCustomRoles` mode iterates over a json file containing an array of role json and either creates or updates each.  Promises are resolved sequentially to avoid rate limiting.
- `bulkUpsertCustomRoleFolder` mode does the same on a folder of json files.

```
ldutils bulkUpsertCustomRoles ./exampleRoleBulkLoad.json
ldutils bulkUpsertCustomRoleFolder ./companyRoles
```

For details on role policy object structures, please see: https://docs.launchdarkly.com/docs/custom-roles

### Team members

| Mode | parameters |
| ---- | ---------- |
| getTeamMembers | none |
| getTeamMember | memberId |
| getTeamMemberByEmail | emailAddress |
