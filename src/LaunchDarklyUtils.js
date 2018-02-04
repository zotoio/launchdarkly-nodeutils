import { LaunchDarklyApiClient } from './LaunchDarklyApiClient';
import { LaunchDarklyLogger } from './LaunchDarklyLogger';

let log = LaunchDarklyLogger.logger();

export class LaunchDarklyUtils {
    async create(API_TOKEN, customLogger) {
        if (customLogger) log = customLogger;
        this.apiClient = await LaunchDarklyApiClient.create(API_TOKEN, log);
        return this;
    }

    async getFeatureFlags(projectKey) {
        return this.apiClient.apis.flags.getFeatureFlags({ projectKey: projectKey });
    }

    async getFeatureFlag(projectKey, featureFlagKey, environmentKeyQuery) {
        return this.apiClient.apis.flags.getFeatureFlag({
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
        return this.apiClient.apis.flags.patchFeatureFlag({
            projectKey: projectKey,
            featureFlagKey: featureFlagKey,
            patchDelta: [{ op: 'replace', path: `/environments/${environmentKeyQuery}/on`, value: value }]
        });
    }
}
