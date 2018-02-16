import { default as fs } from 'fs';
import { expect } from 'chai';
import { describe, it, before, beforeEach } from 'mocha';
import { default as nock } from 'nock';
import { LaunchDarklyUtils } from '../src/LaunchDarklyUtils';
import { LaunchDarklyLogger } from '../src/LaunchDarklyLogger';

let log = LaunchDarklyLogger.logger();

describe('LaunchDarklyUtilsRoles', function() {
    let ldutils;
    beforeEach(async () => {
        ldutils = await new LaunchDarklyUtils().create('MOCK', log);
    });

    describe('getCustomRoles', function() {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .get('/api/v2/roles')
                .replyWithFile(200, __dirname + '/fixtures/list-custom-roles.json', {
                    'Content-Type': 'application/json'
                });
            log.debug(scope);
            done();
        });

        it('should make expected api call', async function() {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/list-custom-roles.json', 'utf-8'));
            return ldutils.roles.getCustomRoles().then(actual => {
                expect(actual.obj).to.deep.equal(expected);
            });
        });
    });

    describe('getCustomRole', function() {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .get('/api/v2/roles/example-role')
                .replyWithFile(200, __dirname + '/fixtures/get-custom-role.json', {
                    'Content-Type': 'application/json'
                });
            log.debug(scope);
            done();
        });

        it('should make expected api call', async function() {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/get-custom-role.json', 'utf-8'));
            return ldutils.roles.getCustomRole('example-role').then(actual => {
                expect(actual.obj).to.deep.equal(expected);
            });
        });
    });
});
