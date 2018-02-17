import { LaunchDarklyUtilsMembers } from './LaunchDarklyUtilsMembers';
import { LaunchDarklyUtilsFlags } from './LaunchDarklyUtilsFlags';
import { LaunchDarklyUtilsRoles } from './LaunchDarklyUtilsRoles';
import { LaunchDarklyApiClient } from './LaunchDarklyApiClient';
import { LaunchDarklyLogger } from './LaunchDarklyLogger';
import { default as dotenv } from 'dotenv';
dotenv.config();

export class LaunchDarklyUtils {
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
