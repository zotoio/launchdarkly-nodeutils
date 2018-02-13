import { default as jsonPatch } from 'fast-json-patch';
import { default as fs } from 'fs';
import { default as path } from 'path';
import { default as globule } from 'globule';

export class LaunchDarklyUtilsRoles {
    constructor(apiClient, log) {
        this.log = log;
        this.apiClient = apiClient;
    }

    get API_GROUP() {
        return 'Custom roles';
    }

    async getCustomRoles() {
        return this.apiClient.apis[this.API_GROUP].getCustomRoles();
    }

    async getCustomRole(customRoleKey) {
        return this.apiClient.apis[this.API_GROUP].getCustomRole({ customRoleKey: customRoleKey });
    }

    async createCustomRole(customRoleKey, customRoleName, customRolePolicyArray, customRoleDescription) {
        let customRole = {
            name: customRoleName,
            key: customRoleKey,
            description: customRoleDescription,
            policy: customRolePolicyArray
        };
        return this.apiClient.apis[this.API_GROUP].postCustomRole({ customRoleBody: customRole });
    }

    async updateCustomRole(customRoleKey, customRoleName, customRolePolicyArray, customRoleDescription) {
        let updatedCustomRole = {
            name: customRoleName,
            key: customRoleKey,
            description: customRoleDescription,
            policy: customRolePolicyArray
        };

        let that = this;
        return this.getCustomRole(customRoleKey)

            .then(customRoleResponse => {
                let patchDelta = jsonPatch.compare(customRoleResponse.obj, updatedCustomRole);
                that.log.debug(`customRoleDiff for '${customRoleKey}' ${JSON.stringify(patchDelta)}`);
                return patchDelta;
            })
            .then(patchDelta => {
                return this.apiClient.apis[this.API_GROUP].patchCustomRole({
                    customRoleKey: customRoleKey,
                    patchDelta: patchDelta
                });
            });
    }

    async upsertCustomRole(customRoleKey, customRoleName, customRolePolicyArray, customRoleDescription) {
        let that = this;
        return this.getCustomRole(customRoleKey)

            .then(() => {
                that.log.info(`Role '${customRoleKey}' Found, Updating...`);
                return this.updateCustomRole(
                    customRoleKey,
                    customRoleName,
                    customRolePolicyArray,
                    customRoleDescription
                );
            })

            .catch(e => {
                that.log.error(e);
                that.log.info(`Role '${customRoleKey}' Not Found, Creating...`);
                return this.createCustomRole(
                    customRoleKey,
                    customRoleName,
                    customRolePolicyArray,
                    customRoleDescription
                );
            });
    }

    async bulkUpsertCustomRoles(roleBulkLoadFile) {
        let filePath = path.resolve(roleBulkLoadFile);
        let roles = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        let that = this;

        this.log.info(`Bulk Upserting Roles from File: ${filePath}`);

        return roles.reduce(function(acc, role) {
            return acc.then(function(results) {
                return that.upsertCustomRole(role.key, role.name, role.policy, role.description).then(function(data) {
                    results.push(data);
                    return results;
                });
            });
        }, Promise.resolve([]));
    }

    async bulkUpsertCustomRoleFolder(roleFolder) {
        let folderPath = path.normalize(path.resolve(roleFolder));
        let globMatch = folderPath + '/*.json';
        this.log.info(`Looking for Files with Pattern '${globMatch}'`);
        let fileArray = globule.find(globMatch);
        let results = [];
        let that = this;
        fileArray.forEach(async function(file) {
            that.log.info(`Found File '${file}'. Calling 'bulkUpsertCustomRoles'`);
            let result = await that.bulkUpsertCustomRoles(file);
            results.push(result);
        });
        return results;
    }
}
