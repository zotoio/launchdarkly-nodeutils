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

    switch (mode) {
        case 'getFlags':
            let projectId = args[1];
            if (!projectId || projectId.trim() === '') {
                result = 'please supply a projectId as second parameter'
                break;
            }
            result = await ldUtils.getFlags(projectId);
            break;

        default:
            result = 'please supply a mode parameter: getFlags';

    }

    log.info(result);

})();

