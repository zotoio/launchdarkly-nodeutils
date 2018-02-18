## Contributing

Fork this repository and work on your enhancements, then send a pull request.

Use commitizen for conventional commit messages via `git cz` instead of `git commit`.  
To setup if not already installed:
```
npm install -g commitizen
npm install -g cz-conventional-changelog
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc
```
..or you can just use `npm run commit` which will use local commitizen install.

The reason this approach is used is to automate the release process from travis to github and npm, based on the types of change being mapped to the corresponding http://semver.org/ version.

### API Groupings
Each area of the LaunchDarkly API (eg. roles, flags) is grouped into a separate class, that is attached to the central LaunchDarklyUtils class.

When a new api function is added:

1. ensure it is in the correct API group class, and that jsdoc annotations are included.
1. ensure that unit tests are created, and that the overall test suite passes `npm test`
1. if a new API group is required, ensure it is attached to the central LaunchDarklyUtils class.
1. ensure the `ldutils` commandline executable is updated to accordingly, along with README.md commandline docs.

### General standards
- we use eslint in conjunction with https://github.com/prettier/prettier to enforce style.
- we use codeclimate to track coverage and code smells.  When you raise a pull request, please take note of the results and address any regressions.
- function and parameter naming should map to the underlying swagger open api definition where applicable https://launchdarkly.github.io/ld-openapi/swagger.yaml (file periodically pulled into this module).
- functions should generally return a promise resolving as the json response from LD API, and throw an Error containing api, message and docs link.  eg.

```javascript
     /**
     * Get all feature flags in project
     * @param {string} projectKey - project identifier
     * @returns {Promise}
     * @fulfil {Object} feature flag list json
     * @reject {Error} object with message
     */
    async getFeatureFlags(projectKey) {
        try {
            return this.apiClient.apis[this.API_GROUP].getFeatureFlags({ projectKey: projectKey });
        } catch (e) {
            throw {
                api: 'getFeatureFlags',
                message: e.message,
                docs: 'https://apidocs.launchdarkly.com/docs/list-feature-flags'
            };
        }
    }
```

