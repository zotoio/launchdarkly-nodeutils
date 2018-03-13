import { default as _ } from 'lodash';

// Class representing Team member functionality
export class LaunchDarklyUtilsMembers {
    /**
     * Team member specific api functions attached as 'LaunchDarklyUtils.members'
     * @constructor LaunchDarklyUtilsMembers
     * @param { Swagger } apiClient - generated launchdarkly apiClient
     * @param { Object } log - logger implementation, or 'console'
     * @param { LaunchDarklyUtils } ldUtils - primary utils class
     * @returns { LaunchDarklyUtilsMembers } team member api functions
     */
    constructor(apiClient, log, ldUtils) {
        this.log = log;
        this.apiClient = apiClient;
        this.ldUtils = ldUtils;
        if (!this.ldUtils) {
            throw {
                message: 'LaunchDarklyUtilsRoles constructor requires ldUtils parameter'
            };
        }
    }

    /**
     * Api group object key in LD api
     * @returns {string}
     */
    get API_GROUP() {
        return 'Team members';
    }

    /**
     * Get all team members in account
     * @returns {Promise}
     * @fulfil {Object} team member list json
     * @reject {Error} object with message
     * @example ldutils getTeamMembers
     */
    async getTeamMembers() {
        try {
            return this.apiClient.apis[this.API_GROUP].getMembers().then(response => {
                return response.body;
            });
        } catch (e) {
            throw {
                api: 'getMembers',
                message: e.message,
                docs: 'https://apidocs.launchdarkly.com/docs/list-team-members'
            };
        }
    }

    /**
     * get a single team member by id
     * @param memberId - _id field of team member
     * @returns {Promise}
     * @fulfil {Object} team member object json
     * @reject {Error} object with message
     * @example ldutils getTeamMember 5a3ad672761af020881a8814
     */
    async getTeamMember(memberId) {
        try {
            return this.apiClient.apis[this.API_GROUP].getMember({ memberId: memberId }).then(response => {
                return response.body;
            });
        } catch (e) {
            throw {
                api: 'getMember',
                message: e.message,
                docs: 'https://apidocs.launchdarkly.com/docs/get-team-member'
            };
        }
    }

    /**
     * Get a team member using a supplied email address
     * @param {string} emailAddress - email address of member to locate
     * @returns {Promise}
     * @fulfil {Object} team member json
     * @reject {Error} object with message
     * @example ldutils getTeamMemberByEmail owner-sample-account@launchdarkly.com
     */
    async getTeamMemberByEmail(emailAddress) {
        return this.getTeamMembers().then(memberList => {
            let members = _.filter(memberList.items, { email: emailAddress });

            if (members.length !== 1) {
                throw {
                    api: 'getTeamMembers',
                    message: `member not found for email ${emailAddress}`,
                    docs: 'https://apidocs.launchdarkly.com/docs/list-team-members'
                };
            }

            return members[0];
        });
    }

    /**
     * Get a team member including customRoleKeys translated from customRoles array
     * @param {string} emailAddress - email address of member to locate
     * @returns {Promise}
     * @fulfil {Object} team member json
     * @reject {Error} object with message
     * @example ldutils getTeamMemberCustomRoles owner-sample-account@launchdarkly.com
     */
    async getTeamMemberCustomRoles(emailAddress) {
        let teamMember = await this.getTeamMemberByEmail(emailAddress);
        teamMember.customRoleKeys = [];
        return this.ldUtils.roles.getCustomRoles().then(roles => {
            teamMember.customRoles.forEach(memberRoleId => {
                try {
                    teamMember.customRoleKeys.push(_.filter(roles.items, { _id: memberRoleId })[0]['key']);
                } catch (e) {
                    throw {
                        api: 'getTeamMemberCustomRoles',
                        message: `role not found for _id ${memberRoleId}`,
                        docs: 'https://apidocs.launchdarkly.com/docs/list-team-members'
                    };
                }
            });
            return teamMember;
        });
    }
}
