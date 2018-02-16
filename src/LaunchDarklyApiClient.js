import Swagger from 'swagger-client';
import jsYaml from 'js-yaml';
import { default as fs } from 'fs';
import { default as json } from 'format-json';

export class LaunchDarklyApiClient {
    static async create(API_TOKEN, log) {
        log.debug(`creating api client with token: ${API_TOKEN}`);

        // swagger.yaml from https://launchdarkly.github.io/ld-openapi/swagger.yaml
        const swaggerYaml = fs.readFileSync(__dirname + `/../swagger.yaml`, 'utf-8').toString();
        const swaggerJson = jsYaml.safeLoad(swaggerYaml);

        return Swagger({
            spec: swaggerJson,
            usePromise: true,
            requestInterceptor: req => {
                req.headers.Authorization = API_TOKEN;
                log.debug(`REQUEST: ${json.plain(req)}`);

                return req;
            },
            responseInterceptor: res => {
                log.debug(`RESPONSE: ${json.plain(res)}`);

                if (res.status !== 200) {
                    log.debug(`ERROR: ${json.plain(res)}`);
                    throw res;
                }

                return res;
            }
        });
    }
}
