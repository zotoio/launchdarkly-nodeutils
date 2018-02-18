import { default as bunyan } from 'bunyan';
import { default as bformat } from 'bunyan-format';
import { default as dotenv } from 'dotenv';
dotenv.config();

let level = process.env.LAUNCHDARKLY_API_LOGLEVEL || 'info';

let LOG = bunyan.createLogger({
    level: level,
    name: 'ldu',
    streams: [
        {
            stream: bformat({ outputMode: 'short' })
        }
    ]
});

/**
 * @class
 */
export class LaunchDarklyLogger {
    /**
     * Get handle on Bunyan logger.  This is the default logger if not supplied to utils.
     * @returns {Logger}
     */
    static logger() {
        return LOG;
    }
}
