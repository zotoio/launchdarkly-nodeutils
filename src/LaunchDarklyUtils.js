import { LaunchDarklyUtilsFlags } from './LaunchDarklyUtilsFlags';
import { LaunchDarklyUtilsRoles } from './LaunchDarklyUtilsRoles';
import { LaunchDarklyApiClient } from './LaunchDarklyApiClient';
import { LaunchDarklyLogger } from './LaunchDarklyLogger';
import { default as dotenv } from 'dotenv';
dotenv.config();

export class LaunchDarklyUtils {
    async create(API_TOKEN, customLogger) {
        // setup logger
        this.log = customLogger ? customLogger : LaunchDarklyLogger.logger();
        this.log.debug('logger attached..');

        // create LaunchDarkly apiClient
        this.apiClient = await LaunchDarklyApiClient.create(API_TOKEN, this.log);
        this.log.debug('api client instantiated..');

        // attach flag utils
        this.flags = new LaunchDarklyUtilsFlags(this.apiClient, this.log);
        this.log.debug(`flag functions: ${this.flags}`);

        // attach role utils
        this.roles = new LaunchDarklyUtilsRoles(this.apiClient, this.log);
        this.log.debug(`role functions: ${this.roles}`);

        return this;
    }
}
