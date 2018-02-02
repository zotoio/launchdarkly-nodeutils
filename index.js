import { LaunchDarklyUtils } from './src/LaunchDarklyUtils';
import { LaunchDarklyLogger } from './src/LaunchDarklyLogger';
import { default as dotenv } from 'dotenv';
dotenv.config();

let log = LaunchDarklyLogger.logger();

let args = process.argv.slice(2);
log.info(`command line args: ${args}`);

(async () => {

    let ldUtils = await new LaunchDarklyUtils().create(process.env.LAUNCHDARKLY_API_TOKEN, log);

    let mode = args[0];
    let result;
    let projectKey, featureFlagKey, environmentKeyQuery;

    switch (mode) {
        case 'getFeatureFlags':
            projectKey = args[1];
            if (!projectKey || projectKey.trim() === '') {
                result = 'please supply a projectKey as second parameter'
                break;
            }
            result = await ldUtils.getFeatureFlags(projectKey);
            break;

        case 'getFeatureFlag':
            projectKey = args[1];
            featureFlagKey = args[2];
            environmentKeyQuery = args[3];
            if (!projectKey || projectKey.trim() === '') {
                result = 'please supply a projectKey as second parameter'
                break;
            }
            if (!featureFlagKey || featureFlagKey.trim() === '') {
                result = 'please supply a featureFlagKey as third parameter'
                break;
            }
            if (!environmentKeyQuery || environmentKeyQuery.trim() === '') {
                result = 'please supply a environmentKeyQuery as fourth parameter'
                break;
            }
            result = await ldUtils.getFeatureFlag(projectKey, featureFlagKey, environmentKeyQuery);
            break;

        default:
            result = 'please supply a mode parameter: getFeatureFlags, getFeatureFlag';

    }

    log.info(result);

})();

