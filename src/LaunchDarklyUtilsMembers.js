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
        return 'Account members';
    }

    /**
     * Get all team members in account
     * @returns {Promise}
     * @param limit - max number of members to return (defaults to 20 per api)
     * @param offset - starting offset to return
     * @param filter - an optional filter https://apidocs.launchdarkly.com/reference#list-team-members
     * @fulfil {Object} team member list json
     * @reject {Error} object with message
     * @example ldutils getTeamMembers
     */
    async getTeamMembers(limit, offset, filter) {
        try {
            return this.apiClient.apis[this.API_GROUP]
                .getMembers({ limit: limit, offset: offset, filter: filter })
                .then(response => {
                    return response.body;
                });
        } catch (e) {
            throw {
                api: 'getMembers',
                message: e.message,
                docs: 'https://apidocs.launchdarkly.com/tag/Account-members#operation/getMembers'
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
            return this.apiClient.apis[this.API_GROUP].getMember({ id: memberId }).then(response => {
                return response.body;
            });
        } catch (e) {
            throw {
                api: 'getMember',
                message: e.message,
                docs: 'https://apidocs.launchdarkly.com/tag/Account-members#operation/getMember'
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
                    docs: 'https://apidocs.launchdarkly.com/tag/Account-members#operation/getMembers'
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
                        docs: 'https://apidocs.launchdarkly.com/tag/Account-members#operation/getMembers'
                    };
                }
            });
            return teamMember;
        });
    }

    /**
     * Invite a New Team Member by their Email Address
     * @param { String } emailAddress - Email Address of New Member
     * @param { String } initialRoleKey - Default Role for New Member
     * @returns {Promise}
     * @fulfil {Object} Team Member JSON
     * @reject {Error} object with message
     */
    async inviteTeamMember(emailAddress, initialRoleKey = 'reader') {
        // Define var instead of inlining it for ease of reading later...
        let defaultRoles = ['reader', 'writer', 'admin', 'owner'];
        let user = { email: emailAddress };
        let members = { membersBody: [] };
        // If Custom Role is Requested, the Key in the Member Object is different...
        !defaultRoles.includes(initialRoleKey) ? (user.customRoles = [initialRoleKey]) : (user.role = initialRoleKey);
        members.membersBody.push(user);
        try {
            return this.apiClient.apis[this.API_GROUP].postMembers({}, { requestBody: members }).then(response => {
                return response.body;
            });
        } catch (e) {
            throw {
                api: 'postMembers',
                message: e.message,
                docs: 'https://apidocs.launchdarkly.com/tag/Account-members#operation/postMembers'
            };
        }
    }
}
