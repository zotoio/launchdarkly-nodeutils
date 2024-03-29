import Swagger from 'swagger-client';
import { default as fs } from 'fs';
import { default as json } from 'format-json';
import { default as HttpsProxyAgent } from 'https-proxy-agent';
import { default as fetch } from 'node-fetch';

/**
 * @class
 */
export class LaunchDarklyApiClient {
    /**
     * Used internally by LaunchDarklyUtils to create an instance of
     * Swagger apiClient with interceptors configured
     * @param {string} API_TOKEN - from LaunchDarkly dashboard
     * @param { Object } log - logger implementation
     * @param { string } openapiJsonString - optional serialized json
     * @returns {Promise}
     * @fulfil {Swagger} apiClient generated by swagger-js
     * @reject {Error} object with message
     */
    static async create(API_TOKEN, log, openapiJsonString) {
        log.debug(`creating api client with token: ${API_TOKEN}`);

        let proxy = process.env.http_proxy || process.env.https_proxy || null;
        let agent = null;
        if (proxy) {
            agent = new HttpsProxyAgent(proxy);
            log.debug(`using proxy from env var https_proxy=${proxy}`);
        }

        // openapi.json from https://static.launchdarkly.com/app/s/openapi.52aa3dc63.json
        const openapiJson = openapiJsonString || fs.readFileSync(__dirname + `/../openapi.json`, 'utf-8').toString();

        return Swagger({
            spec: JSON.parse(openapiJson),
            usePromise: true,
            requestContentType: 'application/json',
            requestInterceptor: req => {
                req.userFetch = fetch;
                req.agent = agent;
                req.headers.Authorization = API_TOKEN;
                log.debug(`REQUEST: ${json.plain(req)}`);

                return req;
            },
            responseInterceptor: res => {
                log.debug(`RESPONSE: ${json.plain(res)}`);

                if (res.status > 299) {
                    log.debug(`ERROR: ${json.plain(res)}`);
                    throw res;
                }

                return res;
            }
        });
    }
}
