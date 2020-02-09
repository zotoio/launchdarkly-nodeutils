import { LaunchDarklyUtilsMembers } from './LaunchDarklyUtilsMembers';
import { LaunchDarklyUtilsFlags } from './LaunchDarklyUtilsFlags';
import { LaunchDarklyUtilsRoles } from './LaunchDarklyUtilsRoles';
import { LaunchDarklyApiClient } from './LaunchDarklyApiClient';
import { LaunchDarklyLogger } from './LaunchDarklyLogger';
import { default as dotenv } from 'dotenv';
dotenv.config();

/**
 * @class
 */
export class LaunchDarklyUtils {
    /**
     * Create an instance of ldutils with api specific classes attached. This is the primary class used to access apis,
     * as api grouping util classes are attached to this class.
     * @param {string} API_TOKEN - from LaunchDarkly dashboard
     * @param { Object } customLogger - logger implementation, or 'console'. If not supplied, defaults to Bunyan logger
     * @param { string } swaggerYamlString - optional serialized yaml
     * @returns {Promise}
     * @fulfil {LaunchDarklyUtils}
     * @reject {Error} object with message
     */
    async create(API_TOKEN, customLogger, swaggerYamlString) {
        // setup logger
        this.log = customLogger ? customLogger : LaunchDarklyLogger.logger();
        this.log.debug('logger attached..');

        // create LaunchDarkly apiClient
        try {
            this.apiClient = await LaunchDarklyApiClient.create(API_TOKEN, this.log, swaggerYamlString);
            this.log.debug('api client instantiated..');

            // attach utils
            this.flags = new LaunchDarklyUtilsFlags(this.apiClient, this.log, this);
            this.roles = new LaunchDarklyUtilsRoles(this.apiClient, this.log, this);
            this.members = new LaunchDarklyUtilsMembers(this.apiClient, this.log, this);
            this.log.debug(`utils ready.`);
        } catch (e) {
            this.log.error(e);
            throw e;
        }
        return this;
    }
}
