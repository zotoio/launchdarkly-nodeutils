import { LaunchDarklyApiClient } from './LaunchDarklyApiClient';
import { LaunchDarklyLogger } from './LaunchDarklyLogger';

let log = LaunchDarklyLogger.logger();

export class LaunchDarklyUtils {
    async create(API_TOKEN, customLogger) {
        if (customLogger) log = customLogger;
        this.apiClient = await LaunchDarklyApiClient.create(API_TOKEN, log);
        return this;
    }

    async getFlags(projectKey) {
        return this.apiClient.apis.flags.getFeatureFlags({ projectKey: projectKey });
    }
}
