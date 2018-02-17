import { default as _ } from 'lodash';

export class LaunchDarklyUtilsMembers {
    constructor(apiClient, log) {
        this.log = log;
        this.apiClient = apiClient;
    }

    get API_GROUP() {
        return 'Team members';
    }

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
