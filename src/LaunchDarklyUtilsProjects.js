// Class representing Projects functionality

export class LaunchDarklyUtilsProjects {
    /**
     * Projects specific api functions attached as 'LaunchDarklyUtils.projects'
     * @constructor LaunchDarklyUtilsProjects
     * @param { Swagger } apiClient - generated launchdarkly apiClient
     * @param { Object } log - logger implementation, or 'console'
     * @param { LaunchDarklyUtils } ldUtils - primary utils class
     * @returns { LaunchDarklyUtilsMembers } team member api functions
     */
    constructor(apiClient, log, ldUtils) {
        this.log = log;
        this.apiClient = apiClient;
        this.ldUtils = ldUtils;
        if (!this.ldUtils) {
            throw {
                message: 'LaunchDarklyUtilsProjects constructor requires ldUtils parameter'
            };
        }
    }

    /**
     * Api group object key in LD api
     * @returns {string}
     */
    get API_GROUP() {
        return 'Projects';
    }

    /**
     * Get all projects in account
     * @returns {Promise}
     * @fulfil {Object} List of projects JSON
     * @reject {Error} object with message
     * @example ldutils getProjects
     */
    async getProjects() {
        return this.apiClient.apis[this.API_GROUP]
            .getProjects()
            .then(response => {
                return response.body;
            })
            .catch(e => {
                throw {
                    api: 'getProjects',
                    message: e.message,
                    docs: 'https://apidocs.launchdarkly.com/tag/Projects#operation/getProjects'
                };
            });
    }

    /**
     * get a single project by project key
     * @param projectKey - _id field of team member
     * @returns {Promise}
     * @fulfil {Object} project object json
     * @reject {Error} object with message
     * @example ldutils getProject new-project
     */
    async getProject(projectKey) {
        return this.apiClient.apis[this.API_GROUP]
            .getProject({ projectKey: projectKey })
            .then(response => {
                return response.body;
            })
            .catch(e => {
                throw {
                    api: 'getProject',
                    message: e.message,
                    docs: 'https://apidocs.launchdarkly.com/tag/Projects#operation/getProjects'
                };
            });
    }

    /**
     * Create a project in the account
     * @param {*} projectName - the name of the project
     * @param {*} projectKey - the key that identifies the project
     * @param {*} includeInSnippetByDefault - boolean true / false of whether should include a snippet
     * @param {*} tags - arrays of tags that can be associated with the project
     * @param {*} environments - an array of environments that are associated with the account
     * @param {*} defaultClientSideAvailability - An object that defines wether the SDK and / or mobile flags are available
     * @returns {Promise}
     * @fulfil {Object} project object json
     * @reject {Error} object with message
     * @example ldutils createProject new-project 'New Project' 'false' dev,Development,#41705:test,Test,f5a623 'true' 'false' marketing,online
     */
    async createProject(
        projectKey,
        projectName,
        includeInSnippetByDefault,
        environments,
        usingEnvironmentId,
        usingMobileKey,
        tags
    ) {
        let includeInSnippetByDefaultBool;
        if (typeof includeInSnippetByDefault !== 'undefined') {
            if (includeInSnippetByDefault === 'true') {
                includeInSnippetByDefaultBool = true;
            } else {
                includeInSnippetByDefaultBool = false;
            }
        }
        let defaultClientSideAvailability;
        if (
            typeof includeInSnippetByDefaultBool === 'undefined' &&
            (typeof usingEnvironmentId != 'undefined' || typeof usingMobileKey != 'undefined')
        ) {
            if (typeof usingEnvironmentId === 'undefined' || usingEnvironmentId === 'true') {
                usingEnvironmentId = true;
            } else {
                usingEnvironmentId = false;
            }
            if (typeof usingMobileKey === 'undefined' || usingMobileKey === 'true') {
                usingMobileKey = true;
            } else {
                usingMobileKey = false;
            }
            defaultClientSideAvailability = {
                usingEnvironmentId,
                usingMobileKey
            };
        }
        const newProject = {
            key: projectKey,
            name: projectName,
            includeInSnippetByDefault: includeInSnippetByDefaultBool,
            tags: this.getTagsArray(tags),
            environments: this.getEnvironmentsArray(environments),
            defaultClientSideAvailability
        };
        return this.apiClient.apis[this.API_GROUP]
            .postProject({ projectBody: newProject })
            .then(response => {
                return response.body;
            })
            .catch(e => {
                throw {
                    api: 'createProject',
                    message: e.message,
                    docs: 'https://apidocs.launchdarkly.com/tag/Projects#operation/postProject'
                };
            });
    }

    /**
     * Patch a single project using jsonPatch notation
     * @param {*} projectKey - projectKey a key that identifies the project
     * @param {*} jsonPatch - an array of string using the JSON patch notation https://tools.ietf.org/html/rfc6902
     * @returns {Promise}
     * @fulfil {Object} an empty project
     * @reject {Error} object with message
     * @example ldutils updateProject new-project [{ op: 'replace', path: '/name', value: 'New project name' }]
     */
    async updateProject(projectKey, jsonPatch) {
        return this.apiClient.apis[this.API_GROUP]
            .patchProject({ projectKey: projectKey, patchDelta: jsonPatch })
            .then(response => {
                return response.body;
            })
            .catch(e => {
                throw {
                    api: 'patchProject',
                    message: e.message,
                    docs: 'https://apidocs.launchdarkly.com/tag/Projects#operation/patchProject'
                };
            });
    }

    /**
     * Delete a project
     * @param {*} projectKey - projectKey a key that identifies the project
     * @fulfil {Object} an empty project
     * @reject {Error} object with message
     * @example ldutils deleteProject new-project
     */
    async deleteProject(projectKey) {
        return this.apiClient.apis[this.API_GROUP]
            .deleteProject({ projectKey: projectKey })
            .then(response => {
                return response.body;
            })
            .catch(e => {
                throw {
                    api: 'deleteProject',
                    message: e.message,
                    docs: 'https://apidocs.launchdarkly.com/tag/Projects#operation/deleteProject'
                };
            });
    }

    getTagsArray(tags) {
        let tagsArray = [];
        if (tags) {
            if (tags.includes(',')) {
                tags.split(',').forEach(tag => {
                    tagsArray.push(tag);
                });
            } else {
                // We have a single tag that needs to be added to the environment
                tagsArray.push(tags);
            }
        }
        return tagsArray;
    }

    getEnvironmentsArray(environments) {
        let environmentArray;
        if (environments) {
            environmentArray = [];
            if (environments.includes(':')) {
                environments.split(':').forEach(environment => {
                    environmentArray.push(this.getEnvironmentItem(environment));
                });
            } else {
                environmentArray.push(this.getEnvironmentItem(environments));
            }
        }
        return environmentArray;
    }

    getEnvironmentItem(environment) {
        let environmentParts;
        if (environment) {
            environmentParts = environment.split(',');
        }
        if (!environment || environmentParts.length < 3) {
            throw 'Invalid environments configuration, should have 3 items, key, name and colour';
        }
        const environmentItem = {
            key: environmentParts[0],
            name: environmentParts[1],
            color: environmentParts[2]
        };

        return environmentItem;
    }
}
