import Swagger from 'swagger-client';
import jsYaml from 'js-yaml';
import { default as fs } from 'fs';

export class LaunchDarklyApiClient {
    static async create(API_TOKEN, log) {
        log.debug(`creating api client with token: ${API_TOKEN}`);

        // swagger.yaml from https://launchdarkly.github.io/ld-openapi/swagger.yaml
        const yaml = fs.readFileSync(__dirname + `/../swagger.yaml`, 'utf-8').toString();
        const json = jsYaml.safeLoad(yaml);

        return Swagger({
            spec: json,
            usePromise: true,
            requestInterceptor: req => {
                req.headers.Authorization = API_TOKEN;

                log.debug(req);

                return req;
            }
        });
    }
}
