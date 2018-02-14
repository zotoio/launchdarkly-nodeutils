export class LaunchDarklyUtilsFlags {
    constructor(apiClient, log) {
        this.log = log;
        this.apiClient = apiClient;
    }

    get API_GROUP() {
        return 'Feature flags';
    }

    async getFeatureFlags(projectKey) {
        return this.apiClient.apis[this.API_GROUP].getFeatureFlags({ projectKey: projectKey });
    }

    async getFeatureFlag(projectKey, featureFlagKey, environmentKeyQuery) {
        return this.apiClient.apis[this.API_GROUP].getFeatureFlag({
            projectKey: projectKey,
            featureFlagKey: featureFlagKey,
            environmentKeyQuery: environmentKeyQuery
        });
    }

    async getFeatureFlagState(projectKey, featureFlagKey, environmentKeyQuery) {
        return this.getFeatureFlag(projectKey, featureFlagKey, environmentKeyQuery).then(result => {
            return result.obj.environments[environmentKeyQuery].on;
        });
    }

    async toggleFeatureFlag(projectKey, featureFlagKey, environmentKeyQuery, value) {
        return this.apiClient.apis[this.API_GROUP].patchFeatureFlag({
            projectKey: projectKey,
            featureFlagKey: featureFlagKey,
            patchComment: [{ op: 'replace', path: `/environments/${environmentKeyQuery}/on`, value: value }]
        });
    }
}
