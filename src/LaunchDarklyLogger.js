import { default as bunyan } from 'bunyan';
import { default as bformat } from 'bunyan-format';

let LOG = bunyan.createLogger({
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
