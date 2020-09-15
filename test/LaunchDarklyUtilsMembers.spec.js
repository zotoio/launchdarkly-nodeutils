import { default as fs } from 'fs';
import { default as _ } from 'lodash';
import { expect } from 'chai';
import { default as assert } from 'assert';
import { describe, it, before, beforeEach } from 'mocha';
import { default as nock } from 'nock';
import { LaunchDarklyUtils } from '../src/LaunchDarklyUtils';
import { LaunchDarklyLogger } from '../src/LaunchDarklyLogger';

let log = LaunchDarklyLogger.logger();

describe('LaunchDarklyUtilsMembers', () => {
    let ldutils;
    beforeEach(async () => {
        ldutils = await new LaunchDarklyUtils().create('MOCK', log);
    });

    describe('getTeamMembers', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .get('/api/v2/members')
                .replyWithFile(200, __dirname + '/fixtures/team-members-list.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });

        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/team-members-list.json', 'utf-8'));
            return ldutils.members.getTeamMembers().then(actual => {
                expect(actual).to.deep.equal(expected);
            });
        });
    });

    describe('getTeamMember', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .get('/api/v2/members/5a3ad672761af020881a8814')
                .replyWithFile(200, __dirname + '/fixtures/team-members-get.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });

        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/team-members-get.json', 'utf-8'));
            return ldutils.members.getTeamMember('5a3ad672761af020881a8814').then(actual => {
                expect(actual).to.deep.equal(expected);
            });
        });
    });

    describe('getTeamMemberByEmail', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .get('/api/v2/members')
                .replyWithFile(200, __dirname + '/fixtures/team-members-list.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });

        it('should make expected api call and return results', async () => {
            let memberList = JSON.parse(fs.readFileSync(__dirname + '/fixtures/team-members-list.json', 'utf-8'));
            let expected = _.filter(memberList.items, { email: 'Member.TheSecond@example.com' })[0];
            return ldutils.members.getTeamMemberByEmail('Member.TheSecond@example.com').then(actual => {
                expect(actual).to.deep.equal(expected);
            });
        });
    });

    describe('getTeamMemberCustomRoles', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .get('/api/v2/members')
                .replyWithFile(200, __dirname + '/fixtures/team-members-list.json', {
                    'Content-Type': 'application/json'
                })
                .get('/api/v2/roles')
                .replyWithFile(200, __dirname + '/fixtures/custom-roles-list.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });

        it('should make expected api call and return results', async () => {
            let teamMembers = JSON.parse(fs.readFileSync(__dirname + '/fixtures/team-members-list.json', 'utf-8'));
            let member = _.filter(teamMembers.items, { email: 'Member.TheSecond@example.com' })[0];
            let expected = _.cloneDeep(member);
            expected.customRoleKeys = ['example-role'];
            return ldutils.members.getTeamMemberCustomRoles('Member.TheSecond@example.com').then(actual => {
                expect(actual).to.deep.equal(expected);
            });
        });
    });

    describe('inviteTeamMember', () => {
        before(done => {
            let scope = nock('https://app.launchdarkly.com')
                .post('/api/v2/members')
                .replyWithFile(201, __dirname + '/fixtures/team-members-get.json', {
                    'Content-Type': 'application/json'
                });
            assert(scope);
            done();
        });

        it('should make expected api call and return results', async () => {
            let expected = JSON.parse(fs.readFileSync(__dirname + '/fixtures/team-members-get.json', 'utf-8'));
            return ldutils.members.inviteTeamMember('owner-sample-account@launchdarkly.com', 'owner').then(actual => {
                expect(actual).to.deep.equal(expected);
            });
        });
    });
});
