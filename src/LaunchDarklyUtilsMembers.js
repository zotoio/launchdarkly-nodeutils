import { default as _ } from 'lodash';

// Class representing Team member functionality
export class LaunchDarklyUtilsMembers {
    /**
     * Team member specific api functions attached as 'LaunchDarklyUtils.members'
     * @constructor LaunchDarklyUtilsMembers
     * @param { Swagger } apiClient - generated launchdarkly apiClient
     * @param { Object } log - logger implementation, or 'console'
     * @returns { LaunchDarklyUtilsMembers } team member api functions
     */
    constructor(apiClient, log) {
        this.log = log;
        this.apiClient = apiClient;
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
     */
    async getTeamMembers() {
        try {
            return this.apiClient.apis[this.API_GROUP].getMembers();
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
     */
    async getTeamMember(memberId) {
        try {
            return this.apiClient.apis[this.API_GROUP].getMember({ memberId: memberId });
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
     */
    async getTeamMemberByEmail(emailAddress) {
        return this.getTeamMembers().then(memberList => {
            let members = _.filter(memberList.body.items, { email: emailAddress });

            if (members.length !== 1) {
                throw {
                    api: 'getTeamMembers',
                    message: `member not found for email ${emailAddress}`,
                    docs: 'https://apidocs.launchdarkly.com/docs/list-team-members'
                };
            }

            return this.getTeamMember(members[0]._id);
        });
    }
}
