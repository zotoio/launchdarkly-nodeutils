import Swagger from 'swagger-client';
import jsYaml from 'js-yaml';
import { default as fs } from 'fs';
import appRoot from 'app-root-path';

export class LaunchDarklyApiClient {
    static async create(API_TOKEN, log) {
        log.info(`creating client with api token: ${API_TOKEN}`);

        // swagger.yaml from https://launchdarkly.github.io/ld-openapi/swagger.yaml
        const yaml = fs.readFileSync(`${appRoot}/swagger.yaml`, 'utf-8').toString();
        const json = jsYaml.safeLoad(yaml);

        return Swagger({
            spec: json,
            usePromise: true,
            requestInterceptor: req => {
                req.headers.Authorization = API_TOKEN;

                // hack - fix incorrect qs mapping..
                req.url = req.url.replace('environmentKeyQuery', 'env');

                log.debug(req);

                return req;
            }
        });
    }
}
