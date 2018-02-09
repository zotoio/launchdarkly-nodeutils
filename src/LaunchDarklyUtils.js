import { LaunchDarklyApiClient } from './LaunchDarklyApiClient';
import { LaunchDarklyLogger } from './LaunchDarklyLogger';
import { default as jsonPatch } from 'fast-json-patch';
import { default as dotenv } from 'dotenv';
dotenv.config();

let log = LaunchDarklyLogger.logger();

export class LaunchDarklyUtils {
    async create(API_TOKEN, customLogger) {
        if (customLogger) log = customLogger;
        this.apiClient = await LaunchDarklyApiClient.create(API_TOKEN, log);
        log.debug(this.apiClient.apis);
        return this;
    }

    async getFeatureFlags(projectKey) {
        return this.apiClient.apis['Feature flags'].getFeatureFlags({ projectKey: projectKey });
    }

    async getFeatureFlag(projectKey, featureFlagKey, environmentKeyQuery) {
        return this.apiClient.apis['Feature flags'].getFeatureFlag({
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
        return this.apiClient.apis['Feature flags'].patchFeatureFlag({
            projectKey: projectKey,
            featureFlagKey: featureFlagKey,
            patchDelta: [{ op: 'replace', path: `/environments/${environmentKeyQuery}/on`, value: value }]
        });
    }

    async getCustomRoles() {
        return this.apiClient.apis['Custom roles'].getCustomRoles();
    }

    async getCustomRole(customRoleKey) {
        return this.apiClient.apis['Custom roles']
            .getCustomRole({
                customRoleKey: customRoleKey
            })
            .catch(e => {
                log.error(e);
                throw e;
            });
    }

    async createCustomRole(customRoleKey, customRoleName, customRolePolicyArray, customRoleDescription) {
        let customRole = {
            name: customRoleName,
            key: customRoleKey,
            description: customRoleDescription,
            policy: customRolePolicyArray
        };
        return this.apiClient.apis['Custom roles'].postCustomRole({ customRoleBody: customRole });
    }

    async updateCustomRole(customRoleKey, customRoleName, customRolePolicyArray, customRoleDescription) {
        let updatedCustomRole = {
            name: customRoleName,
            key: customRoleKey,
            description: customRoleDescription,
            policy: customRolePolicyArray
        };

        return this.getCustomRole(customRoleKey)

            .then(customRoleResponse => {
                let patchDelta = jsonPatch.compare(customRoleResponse.obj, updatedCustomRole);
                log.debug(`customRoleDiff for '${customRoleKey}' ${JSON.stringify(patchDelta)}`);
                return patchDelta;
            })
            .then(patchDelta => {
                return this.apiClient.apis['Custom roles'].patchCustomRole({
                    customRoleKey: customRoleKey,
                    patchDelta: patchDelta
                });
            });
    }

    async upsertCustomRole(customRoleKey, customRoleName, customRolePolicyArray, customRoleDescription) {
        return this.getCustomRole(customRoleKey)

            .then(() => {
                log.info(`role '${customRoleKey}' found, updating..`);
                return this.updateCustomRole(
                    customRoleKey,
                    customRoleName,
                    customRolePolicyArray,
                    customRoleDescription
                );
            })

            .catch(() => {
                log.info(`role '${customRoleKey}' not found, creating..`);
                return this.createCustomRole(
                    customRoleKey,
                    customRoleName,
                    customRolePolicyArray,
                    customRoleDescription
                );
            });
    }
}
