import { default as json } from 'format-json';
import { default as jsonPatch } from 'fast-json-patch';

export class LaunchDarklyUtilsFlags {
    constructor(apiClient, log) {
        this.log = log;
        this.apiClient = apiClient;
    }

    get API_GROUP() {
        return 'Feature flags';
    }

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

    async getFeatureFlag(projectKey, featureFlagKey, environmentKeyQuery) {
        try {
            return this.apiClient.apis[this.API_GROUP].getFeatureFlag({
                projectKey: projectKey,
                featureFlagKey: featureFlagKey,
                environmentKeyQuery: environmentKeyQuery
            });
        } catch (e) {
            throw {
                api: 'getFeatureFlag',
                message: e.message,
                docs: 'https://apidocs.launchdarkly.com/docs/get-feature-flag'
            };
        }
    }

    async getFeatureFlagState(projectKey, featureFlagKey, environmentKeyQuery) {
        return this.getFeatureFlag(projectKey, featureFlagKey, environmentKeyQuery).then(result => {
            return result.obj.environments[environmentKeyQuery].on;
        });
    }

    async updateFeatureFlag(projectKey, featureFlagKey, patchComment) {
        try {
            return this.apiClient.apis[this.API_GROUP].patchFeatureFlag({
                projectKey: projectKey,
                featureFlagKey: featureFlagKey,
                patchComment: patchComment
            });
        } catch (e) {
            throw {
                api: 'patchFeatureFlag',
                message: e.message,
                docs: 'https://apidocs.launchdarkly.com/docs/update-feature-flag'
            };
        }
    }

    async toggleFeatureFlag(projectKey, featureFlagKey, environmentKeyQuery, value) {
        return this.updateFeatureFlag(projectKey, featureFlagKey, [
            { op: 'replace', path: `/environments/${environmentKeyQuery}/on`, value: value }
        ]);
    }

    async migrateFeatureFlag(projectKey, featureFlagKey, fromEnv, toEnv, includeState) {
        let that = this;

        return this.getFeatureFlag(projectKey, featureFlagKey)
            .then(flag => {
                let patchDelta = jsonPatch.compare(flag.obj.environments[toEnv], flag.obj.environments[fromEnv]);
                that.log.debug(`envFlagDiff for '${featureFlagKey}' ${json.plain(patchDelta)}`);
                return patchDelta;
            })
            .then(patchDelta => {
                let patchComment = [];
                patchDelta.forEach(patch => {
                    if (
                        patch.path.startsWith('/targets') ||
                        patch.path.startsWith('/rules') ||
                        patch.path.startsWith('/fallthrough') ||
                        patch.path.startsWith('/offVariation') ||
                        patch.path.startsWith('/prerequisites') ||
                        (includeState && patch.path.startsWith('/on'))
                    ) {
                        // add target env obj path and push
                        patch.path = `/environments/${toEnv}${patch.path}`;
                        patchComment.push(patch);
                    }
                });

                that.log.debug(`patchComment for '${featureFlagKey}' in ${toEnv} : ${json.plain(patchComment)}`);
                return this.updateFeatureFlag(projectKey, featureFlagKey, patchComment);
            });
    }
}
