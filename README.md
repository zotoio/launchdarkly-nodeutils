# LaunchDarkly nodejs utils

[![npm version](https://badge.fury.io/js/launchdarkly-nodeutils.svg)](https://badge.fury.io/js/launchdarkly-nodeutils)
[![Build Status](https://travis-ci.com/zotoio/launchdarkly-nodeutils.svg?branch=master)](https://travis-ci.org/zotoio/launchdarkly-nodeutils)
[![Code Climate](https://img.shields.io/codeclimate/maintainability/zotoio/launchdarkly-nodeutils.svg)](https://codeclimate.com/github/zotoio/launchdarkly-nodeutils)
[![Test Coverage](https://codeclimate.com/github/zotoio/launchdarkly-nodeutils/badges/coverage.svg)](https://codeclimate.com/github/zotoio/launchdarkly-nodeutils/coverage)
[![Greenkeeper badge](https://badges.greenkeeper.io/zotoio/launchdarkly-nodeutils.svg)](https://greenkeeper.io/)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?clear)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

LaunchDarkly (https://launchdarkly.com/) provides SaaS based Feature Flag management at scale, with SDKs for all major languages.

This unofficial module provides NodeJs functions wrapping the LaunchDarkly API.  This is not the sdk for implementing flags in your app - it is the api to manage your account/flags.

## Why?
We need a way to manage flags as part of CI/CD pipelines, and there is not another project currently providing a simple interface to manage flags and other objects in LaunchDarkly via API in nodejs.

## How?
There is an openapi spec available to generate bindings (https://launchdarkly.github.io/ld-openapi/openapi.yaml), so we use the swagger-js module to generate a client (https://github.com/swagger-api/swagger-js), and add some extra features around logging, error handling, and chaining of operations.
In addition we expose apis as a commandline tool.

## Install
1. `npm install launchdarkly-nodeutils -g` (this will install the `ldutils` command).
1. Generate an access token with the permissions for the operations you will use. Please read: https://docs.launchdarkly.com/v2.0/docs/api-access-tokens
1. export your api token `export LAUNCHDARKLY_API_TOKEN=<api-token>`
1. run `ldutils` to confirm your installation was successful - you should see usage instructions.

The installation instructions above should be all you need to do. Alternatively, you can clone this repo and install manually.

After cloning this repo:
1. run `yarn build`
1. check that `ldutils` is executable and run it:
```
chmod 755 ./ldutils
./ldutils
```

The above will display a help screen of instructions, thanks to https://github.com/tj/commander.js/

Optionally you can add `ldutils` to your PATH, or symlink in a directory already in your path:

```
sudo ln -s /<clonepath>/launchdarkly-nodeutils/ldutils /usr/local/bin/ldutils
```
> Make sure you have env var LAUNCHDARKLY_API_TOKEN set, and if piping output to another command, ensure that LAUNCHDARKLY_API_LOGLEVEL is not set to 'debug' to ensure only the json result of the command is returned.

## Use cases
The command line tool or nodejs module can be used for many things.  Here are some examples.

***Automated management of ACLs***

Users of Enterprise LaunchDarkly can create Custom Roles for fine-grained RBAC.  These can be maintained in git, and applied to LaunchDarkly when changes are committed via `bulkUpsertCustomRoles` or `bulkUpsertCustomRoleFolder`.

***Setting flag state for automated tests***

Automated test suites can call the apis to toggle features and set targetting rules before test executions.  With care, a matrix of flag based test scenarios could defined and executed.

***Releasing flags in bulk***

A typical release workflow to move a set of flag attributes from test to prod may consist of CI jobs calling ldutils to:
1. create a backup of flags to be migrated using `getFeatureFlags my-proj > ./backup.json`
2. use `bulkMigrateFeatureFlags my-proj flag-x,flag-y test prod` to copy flag attrs from test to prod
3. if issues, to rollback the flags use `restoreFeatureFlags my-proj flag-x,flag-y prod ./backup.json`

***Scheduled backup of flags***

A cron/ci job could call getFeatureFlags for each project, and commit the json to private git repo in order to keep a versioned record of change.  This could also be used to recover environment state.

***Refreshing Environments***

Copying flag attributes from prod back to preprod for testing. Also newly created environments can be primed with flag targetting rules using `bulkMigrateFeatureFlags`.


## Command line usage

Here are some examples of commandline usage - see below for all available command modes:
```
export LAUNCHDARKLY_API_TOKEN=<api-token>

// collect all flags for a project
ldutils getFeatureFlags <myProjectId>

// update or create a customRole with array of policies
ldutils upsertCustomRole <customRoleKey> <customRoleName> '[{"resources":["proj/*"],"actions":["*"],"effect":"allow"}]'
```

### proxies
If you are executing ldutils via a proxy, just set the https_proxy env var, eg:
```
export https_proxy=http://localhost:3128
```


### commandline modes and parameters
The command line modes and parameters map directly to the functions exposed for use in nodejs apps.
Each call to `ldutils` takes a 'mode', and associated parameters as below:

```
ldutils <mode> [parameter values space separated]
```

The following modes are supported.  This info is also available via: `ldutils -help`

#### Feature flags

| Mode | parameters |
| ---- | ---------- |
| getFeatureFlags | projectKey |
| getFeatureFlag | projectKey, featureFlagKey, environmentKeyQuery |
| getFeatureFlagState | projectKey, featureFlagKey, environmentKeyQuery |
| updateFeatureFlag | projectKey, featureFlagKey, patchComment |
| toggleFeatureFlag | projectKey, featureFlagKey, environmentKeyQuery, enabled |
| migrateFeatureFlag | projectKey, featureFlagKey, fromEnv, toEnv, includeState |
| bulkMigrateFeatureFlags | projectKey, featureFlagKeys, fromEnv, toEnv, includeState |
| restoreFeatureFlags | projectKey, featureFlagKeys, targetEnv, backupJsonFile, includeState |

- `migrateFeatureFlag` mode is used to copy flag attributes between environments.  This covers: targets, rules, fallthrough, offVariation, prerequisites and optionally the flag on/off state. eg. to migrate a flag from dev to test env.

```
ldutils migrateFeatureFlag my-project my-flag dev test
```
> use `bulkMigrateFeatureFlags`with a comma separated list of flags ids to migrations multiple flags in one operation.

#### Custom roles

Custom role functionality requires an Enterprise LaunchDarkly account.

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

#### Team members

| Mode | parameters |
| ---- | ---------- |
| getTeamMembers | none |
| getTeamMember | memberId |
| getTeamMemberByEmail | emailAddress |
| getTeamMemberCustomRoles | emailAddress |
| inviteTeamMember | emailAddress, initialRole |

```
./ldutils inviteTeamMember user@zoto.io reader
```

#### Projects
| Mode          | Parameter                                                                                        |
|---------------|--------------------------------------------------------------------------------------------------|
| getProjects   | none                                                                                             |
| getProject    | projectKey                                                                                       |
| createProject | projectKey, projectName, includeInSnippetByDefault, environments, defaultClientSideAvailability, tags |
| deleteProject | projectKey                                                                                       |
```
./ldutils createProject test-project 'Test Project' true dev,Development,336699:prod,Production,417505

## node app usage
Assumes that you have set the LAUNCHDARKLY_API_TOKEN environment var.

```
let ldUtils = await new LaunchDarklyUtils().create(process.env.LAUNCHDARKLY_API_TOKEN);

// get flag state
let flagEnabled = await ldUtils.getFeatureFlagState('myProject', 'feature-abc', 'dev');

// update flag state to on=true
await ldUtils.toggleFeatureFlag('myProject', 'feature-def', 'dev', true);
```

> please read the [API documentation](API.md) for further details.

## Contributing

Here is a summary.  For more detail see [Contributing](CONTRIBUTING.md).
1. Fork this repo and work on your enhancements.  See note on Commitizen below.
1. Ensure that you include unit tests and jsdoc annotations.
1. Ensure that `yarn test` passes.
1. Use `yarn commit` for conventional commits.
1. Raise a pull request.

### Commitizen
This project uses commitizen for conventional commit messages via `git cz` instead of `git commit`.
The reason for this is that it attaches meaning to each commit that is useful to others, and that is used to automatically version new releases based on http://semver.org

> Just use `yarn commit` instead of git commit and follow instructions.

