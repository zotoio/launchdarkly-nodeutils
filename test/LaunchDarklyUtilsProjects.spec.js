import { default as fs } from 'fs';
// import { default as _ } from 'lodash';
import { expect } from 'chai';
import { default as assert, fail } from 'assert';
import { describe, it, before, beforeEach } from 'mocha';
import { default as nock } from 'nock';
import { LaunchDarklyUtils } from '../src/LaunchDarklyUtils';
import { LaunchDarklyUtilsProjects } from '../src/LaunchDarklyUtilsProjects';
import { LaunchDarklyLogger } from '../src/LaunchDarklyLogger';

let log = LaunchDarklyLogger.logger();

describe('LaunchDarklyUtilsProjects', () => {
    let ldutils;
    beforeEach(async () => {
        ldutils = await new LaunchDarklyUtils().create('MOCK', log);
    });

    describe('fails to create utils', () => {
        try {
            new LaunchDarklyUtilsProjects('MOCK', log, null);
            fail('Would not get here');
        } catch (e) {
            expect(e.message).to.equals('LaunchDarklyUtilsProjects constructor requires ldUtils parameter');
        }
    });

    describe('getProjects successful', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .get('/api/v2/projects')
                .replyWithFile(200, __dirname + '/fixtures/projects-list.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/projects-list.json', 'utf-8'));
            return ldutils.projects.getProjects().then(actual => {
                expect(actual).to.deep.equal(expected);
            });
        });
    });

    describe('getProjects failed', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com').get('/api/v2/projects').replyWithError({
                message: 'Something bad happened',
                code: '401'
            });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            const expected = {
                api: 'getProjects',
                message:
                    'request to https://app.launchdarkly.com/api/v2/projects failed, reason: Something bad happened',
                docs: 'https://apidocs.launchdarkly.com/tag/Projects#operation/getProjects'
            };
            return ldutils.projects
                .getProjects()
                .then(() => {
                    fail('Would not get here');
                })
                .catch(e => {
                    expect(e).to.deep.equals(expected);
                });
        });
    });

    describe('getProject successful', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .get('/api/v2/projects/abc123')
                .replyWithFile(200, __dirname + '/fixtures/projects-get.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/projects-get.json', 'utf-8'));
            return ldutils.projects.getProject('abc123').then(actual => {
                expect(actual).to.deep.equal(expected);
            });
        });
    });

    describe('getProject failed', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com').get('/api/v2/projects/foo').replyWithError(404, {
                message: 'Unknown project key foo',
                code: '404'
            });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            const expected = {
                api: 'getProject',
                message: 'request to https://app.launchdarkly.com/api/v2/projects/foo failed, reason: 404',
                docs: 'https://apidocs.launchdarkly.com/tag/Projects#operation/getProjects'
            };
            return ldutils.projects
                .getProject('foo')
                .then(() => {
                    fail('Would not get here');
                })
                .catch(e => {
                    expect(e).to.deep.equals(expected);
                });
        });
    });

    describe('createProject successful', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .post('/api/v2/projects')
                .replyWithFile(201, __dirname + '/fixtures/projects-create.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/projects-create.json', 'utf-8'));
            const environments = 'dev,Development,blue';
            return ldutils.projects.createProject('testProject', 'Test Project', 'true', environments).then(actual => {
                expect(actual).to.deep.equal(expected);
            });
        });
    });

    describe('createProject successful with project key and name only', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .post('/api/v2/projects')
                .replyWithFile(201, __dirname + '/fixtures/projects-create.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/projects-create.json', 'utf-8'));
            return ldutils.projects.createProject('testProject', 'Test Project').then(actual => {
                expect(actual).to.deep.equal(expected);
            });
        });
    });

    describe('createProject successful with project key and name and includeInSnippetByDefault as true', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .post('/api/v2/projects')
                .replyWithFile(201, __dirname + '/fixtures/projects-create.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/projects-create.json', 'utf-8'));
            return ldutils.projects.createProject('testProject', 'Test Project', 'true').then(actual => {
                expect(actual).to.deep.equal(expected);
            });
        });
    });

    describe('createProject successful with project key and name and includeInSnippetByDefault as false', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .post('/api/v2/projects')
                .replyWithFile(201, __dirname + '/fixtures/projects-create.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/projects-create.json', 'utf-8'));
            return ldutils.projects.createProject('testProject', 'Test Project', 'false').then(actual => {
                expect(actual).to.deep.equal(expected);
            });
        });
    });

    describe('createProject successful with project key, name, includeInSnippetByDefault and environment', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .post('/api/v2/projects')
                .replyWithFile(201, __dirname + '/fixtures/projects-create.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/projects-create.json', 'utf-8'));
            return ldutils.projects
                .createProject('testProject', 'Test Project', 'false', 'dev,Development,blue')
                .then(actual => {
                    expect(actual).to.deep.equal(expected);
                });
        });
    });

    describe('createProject successful with project key, name, environment and usingEnvironmentId is true', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .post('/api/v2/projects')
                .replyWithFile(201, __dirname + '/fixtures/projects-create.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/projects-create.json', 'utf-8'));
            return ldutils.projects
                .createProject('testProject', 'Test Project', undefined, 'dev,Development,blue', 'true')
                .then(actual => {
                    expect(actual).to.deep.equal(expected);
                });
        });
    });

    describe('createProject successful with project key, name, environment and usingEnvironmentId is false', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .post('/api/v2/projects')
                .replyWithFile(201, __dirname + '/fixtures/projects-create.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/projects-create.json', 'utf-8'));
            return ldutils.projects
                .createProject('testProject', 'Test Project', undefined, 'dev,Development,blue', 'false')
                .then(actual => {
                    expect(actual).to.deep.equal(expected);
                });
        });
    });

    describe('createProject successful with project key, name, environment ,usingEnvironmentId and mobileKey is true', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .post('/api/v2/projects')
                .replyWithFile(201, __dirname + '/fixtures/projects-create.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/projects-create.json', 'utf-8'));
            return ldutils.projects
                .createProject('testProject', 'Test Project', undefined, 'dev,Development,blue', 'true', 'true')
                .then(actual => {
                    expect(actual).to.deep.equal(expected);
                });
        });
    });

    describe('createProject successful with project key, name, environment ,usingEnvironmentId and mobileKey is false', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .post('/api/v2/projects')
                .replyWithFile(201, __dirname + '/fixtures/projects-create.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/projects-create.json', 'utf-8'));
            return ldutils.projects
                .createProject('testProject', 'Test Project', undefined, 'dev,Development,blue', 'true', 'false')
                .then(actual => {
                    expect(actual).to.deep.equal(expected);
                });
        });
    });

    describe('createProject successful with project key, name, includeInSnippetByDefault, environment ,usingEnvironmentId and mobileKey', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .post('/api/v2/projects')
                .replyWithFile(201, __dirname + '/fixtures/projects-create.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/projects-create.json', 'utf-8'));
            return ldutils.projects
                .createProject('testProject', 'Test Project', 'true', 'dev,Development,blue', 'true', 'false')
                .then(actual => {
                    expect(actual).to.deep.equal(expected);
                });
        });
    });

    describe('createProject successful with project key, name, includeInSnippetByDefault, environment ,usingEnvironmentId, mobileKey and tags', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .post('/api/v2/projects')
                .replyWithFile(201, __dirname + '/fixtures/projects-create.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/projects-create.json', 'utf-8'));
            return ldutils.projects
                .createProject('testProject', 'Test Project', 'true', 'dev,Development,blue', 'true', 'true', 'foo,bar')
                .then(actual => {
                    expect(actual).to.deep.equal(expected);
                });
        });
    });

    describe('createProject unsuccessful', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com').post('/api/v2/projects').replyWithError({
                message: 'Account already has a project with that key',
                code: '409'
            });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            const expected = {
                api: 'createProject',
                message:
                    'request to https://app.launchdarkly.com/api/v2/projects failed, reason: Account already has a project with that key',
                docs: 'https://apidocs.launchdarkly.com/tag/Projects#operation/postProject'
            };
            const tags = 'foo,bar';
            const environments = 'dev,Development,blue';
            return ldutils.projects
                .createProject('fooProject', 'Foo Project', true, environments, tags)
                .then(() => {
                    fail('Would not get here');
                })
                .catch(e => {
                    expect(e).to.deep.equals(expected);
                });
        });
    });

    describe('updateProject successful', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com').patch('/api/v2/projects/abc123').reply(200, {});
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            const jsonPatch = [{ op: 'replace', path: '/name', value: 'New project name' }];
            return ldutils.projects.updateProject('abc123', jsonPatch).then(actual => {
                expect(actual).to.deep.equal({});
            });
        });
    });

    describe('updateProject unsuccessful', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com').patch('/api/v2/projects/abc123').replyWithError({
                message: 'Unsupported json-patch operation',
                code: '400'
            });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            const expected = {
                api: 'patchProject',
                message:
                    'request to https://app.launchdarkly.com/api/v2/projects/abc123 failed, reason: Unsupported json-patch operation',
                docs: 'https://apidocs.launchdarkly.com/tag/Projects#operation/patchProject'
            };
            const jsonPatch = [
                { op: 'replace', path: '/baz', value: 'boo' },
                { op: 'add', path: '/hello', value: ['world'] },
                { op: 'remove', path: '/foo' }
            ];
            return ldutils.projects
                .updateProject('abc123', jsonPatch)
                .then(() => {
                    fail('Would not get here');
                })
                .catch(e => {
                    expect(e).to.deep.equals(expected);
                });
        });
    });

    describe('deleteProject successful', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com').delete('/api/v2/projects/abc123').reply(204, undefined, {
                'Content-Type': 'application/json'
            });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            return ldutils.projects.deleteProject('abc123').then(actual => {
                expect(actual).to.be.undefined;
            });
        });
    });

    describe('deleteProject unsuccessful', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com').delete('/api/v2/projects/foo').replyWithError({
                message: 'Unknown project key foo',
                code: '404'
            });
            assert(scope);
            done();
        });
        it('should make expected api call and return results', async () => {
            const expected = {
                api: 'deleteProject',
                message:
                    'request to https://app.launchdarkly.com/api/v2/projects/foo failed, reason: Unknown project key foo',
                docs: 'https://apidocs.launchdarkly.com/tag/Projects#operation/deleteProject'
            };
            return ldutils.projects
                .deleteProject('foo')
                .then(() => {
                    fail('Would not get here');
                })
                .catch(e => {
                    expect(e).to.deep.equals(expected);
                });
        });
    });

    describe('getTags', () => {
        it('Should return multiple tags when there are multiple records', () => {
            const expected = ['abc', 'def'];
            const acutual = ldutils.projects.getTagsArray('abc,def');
            expect(acutual).to.deep.equals(expected);
        });

        it('Should return a single tag when there are single record', () => {
            const expected = ['abc'];
            const acutual = ldutils.projects.getTagsArray('abc');
            expect(acutual).to.deep.equals(expected);
        });

        it('Should return an empty array when there is no entry', () => {
            const expected = [];
            const acutual = ldutils.projects.getTagsArray(undefined);
            expect(acutual).to.deep.equals(expected);
        });
    });

    describe('getEnvironmentItem', () => {
        it('Should return an environment item when a proper string is passed in', () => {
            const expected = { key: 'dev', name: 'Development', color: '417505' };
            const acutual = ldutils.projects.getEnvironmentItem('dev,Development,417505');
            expect(acutual).to.deep.equals(expected);
        });

        it('Should throw an error if the input less than three items', () => {
            try {
                ldutils.projects.getEnvironmentItem('dev,Development');
                fail('Would not get here');
            } catch (e) {
                console.log('exception is ' + JSON.stringify(e));
                expect(e).to.equals('Invalid environments configuration, should have 3 items, key, name and colour');
            }
        });

        it('Should throw an error if the inpiut is undefined', () => {
            try {
                ldutils.projects.getEnvironmentItem(undefined);
                fail('Would not get here');
            } catch (e) {
                expect(e).to.equals('Invalid environments configuration, should have 3 items, key, name and colour');
            }
        });
    });

    describe('getEnvironmentsArray', () => {
        it('Should return multiple environments when a string containing environment seperator', () => {
            const expected = [
                { key: 'dev', name: 'Development', color: '417505' },
                { key: 'test', name: 'Test', color: 'f5a623' }
            ];
            const acutual = ldutils.projects.getEnvironmentsArray('dev,Development,417505:test,Test,f5a623');
            expect(acutual).to.deep.equals(expected);
        });

        it('Should return single environments when a string does not contain an environment seperator', () => {
            const expected = [{ key: 'dev', name: 'Development', color: '417505' }];
            const acutual = ldutils.projects.getEnvironmentsArray('dev,Development,417505');
            expect(acutual).to.deep.equals(expected);
        });

        it('Should return an empty array if the environment string provided is empty', () => {
            const expected = undefined;
            const acutual = ldutils.projects.getEnvironmentsArray(undefined);
            expect(acutual).to.deep.equals(expected);
        });
    });
});
