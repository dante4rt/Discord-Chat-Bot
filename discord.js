const axios = require('axios');

class Discord {
  constructor(token) {
    if (!token) {
      throw new Error('Please provide a Discord token');
    }

    this.baseURL = 'https://discord.com/api/v10';
    this.headers = { headers: { authorization: token } };
  }

  async getUserInformation() {
    const url = this.baseURL + '/users/@me';
    const response = await axios.get(url, this.headers);
    return response.data;
  }

  async getMessagesInChannel(channelId, limit) {
    const url = `${this.baseURL}/channels/${channelId}/messages?limit=${limit}`;
    const response = await axios.get(url, this.headers);
    return response.data;
  }

  async sendMessageToChannel(channelId, message) {
    const data = { content: message };
    const url = `${this.baseURL}/channels/${channelId}/messages`;
    const response = await axios.post(url, data, this.headers);
    return response.data;
  }

  async deleteMessageInChannel(channelId, messageId) {
    const url = `${this.baseURL}/channels/${channelId}/messages/${messageId}`;
    const response = await axios.delete(url, this.headers);
    return response.data;
  }

  async joinGuildByInvite(inviteCode) {
    const data = {};
    const url = `${this.baseURL}/invites/${inviteCode}`;
    const response = await axios.post(url, data, this.headers);
    return response.data;
  }

  async leaveGuild(guildId) {
    const url = `${this.baseURL}/users/@me/guilds/${guildId}`;
    const response = await axios.delete(url, this.headers);
    return response.data;
  }
}

module.exports = Discord;
