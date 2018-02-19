import { default as fs } from 'fs';
import { expect } from 'chai';
import { default as assert } from 'assert';
import { describe, it, before, beforeEach } from 'mocha';
import { default as nock } from 'nock';
import { LaunchDarklyUtils } from '../src/LaunchDarklyUtils';
import { LaunchDarklyLogger } from '../src/LaunchDarklyLogger';

let log = LaunchDarklyLogger.logger();

describe('LaunchDarklyUtilsFlags', function() {
    let ldutils;
    beforeEach(async () => {
        ldutils = await new LaunchDarklyUtils().create('MOCK', log);
    });

    describe('getFeatureFlags', function() {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .get('/api/v2/flags/sample-project')
                .replyWithFile(200, __dirname + '/fixtures/feature-flags-list.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });

        it('should make expected api call and return results', async function() {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/feature-flags-list.json', 'utf-8'));
            return ldutils.flags.getFeatureFlags('sample-project').then(actual => {
                expect(actual).to.deep.equal(expected);
            });
        });
    });

    describe('getFeatureFlag', function() {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .get('/api/v2/flags/sample-project/sort.order')
                .replyWithFile(200, __dirname + '/fixtures/feature-flags-get.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });

        it('should make expected api call and return results', async function() {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/feature-flags-get.json', 'utf-8'));
            return ldutils.flags.getFeatureFlag('sample-project', 'sort.order').then(actual => {
                expect(actual).to.deep.equal(expected);
            });
        });
    });

    describe('getFeatureFlagState', function() {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .get('/api/v2/flags/sample-project/sort.order')
                .replyWithFile(200, __dirname + '/fixtures/feature-flags-get.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });

        it('should make expected api call and return results', async function() {
            let expected = true;
            return ldutils.flags.getFeatureFlagState('sample-project', 'sort.order', 'test').then(actual => {
                assert.equal(actual, expected);
            });
        });
    });

    describe('updateFeatureFlag', function() {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .patch('/api/v2/flags/sample-project/sort.order')
                .replyWithFile(200, __dirname + '/fixtures/feature-flags-update.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });

        it('should make expected api call and return results', async function() {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/feature-flags-update.json', 'utf-8'));
            return ldutils.flags
                .updateFeatureFlag('sample-project', 'sort.order', [
                    { op: 'replace', path: '/environments/production/on', value: false }
                ])
                .then(actual => {
                    expect(actual).to.deep.equal(expected);
                });
        });
    });

    describe('toggleFeatureFlag', function() {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .patch('/api/v2/flags/sample-project/sort.order')
                .replyWithFile(200, __dirname + '/fixtures/feature-flags-update.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });

        it('should make expected api call and return results', async function() {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/feature-flags-update.json', 'utf-8'));
            return ldutils.flags.toggleFeatureFlag('sample-project', 'sort.order', 'test', true).then(actual => {
                expect(actual).to.deep.equal(expected);
            });
        });
    });

    describe('migrateFeatureFlag', function() {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .get('/api/v2/flags/sample-project/sort.order')
                .replyWithFile(200, __dirname + '/fixtures/feature-flags-get.json', {
                    'Content-Type': 'application/json'
                })
                .patch('/api/v2/flags/sample-project/sort.order')
                .replyWithFile(200, __dirname + '/fixtures/feature-flags-update.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });

        it('should make expected api call and return results', async function() {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/feature-flags-update.json', 'utf-8'));
            return ldutils.flags
                .migrateFeatureFlag('sample-project', 'sort.order', 'test', 'production')
                .then(actual => {
                    expect(actual).to.deep.equal(expected);
                });
        });
    });
});
