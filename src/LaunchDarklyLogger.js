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

export class LaunchDarklyLogger {
    static logger() {
        return LOG;
    }
}
