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
     * @returns {Promise}
     * @fulfil {LaunchDarklyUtils}
     * @reject {Error} object with message
     */
    async create(API_TOKEN, customLogger) {
        let that = this;
        return new Promise(async (resolve, reject) => {
            // setup logger
            that.log = customLogger ? customLogger : LaunchDarklyLogger.logger();
            that.log.debug('logger attached..');

            // create LaunchDarkly apiClient
            try {
                that.apiClient = await LaunchDarklyApiClient.create(API_TOKEN, this.log);
                that.log.debug('api client instantiated..');

                // attach utils
                that.flags = new LaunchDarklyUtilsFlags(this.apiClient, this.log);
                that.roles = new LaunchDarklyUtilsRoles(this.apiClient, this.log);
                that.members = new LaunchDarklyUtilsMembers(this.apiClient, this.log);
                that.log.debug(`utils ready.`);
            } catch (e) {
                return reject(e);
            }
            return resolve(that);
        });
    }
}
