const axios = require('axios');
const http = require('http');
const https = require('https');
const { default: Axios } = require('axios');

module.exports = {
  requester: (baseUrl) => {
    const requester = axios.create({
      timeout: 60000,
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true }),
    });
    return {
      get: function (url, config) {
        return requester.get((`${baseUrl}${url}`), config);
      },

      post: function (url, data, config) {
        return requester.post(`${baseUrl}${url}`, data, config);
      },
    }
  },

  noexcept: (lambdaFn) => {
    try {
      return lambdaFn();
    } catch (err) {
      return null;
    }
  },

  testUrl: async (url) => {
    try {
      const rsp = await Axios.head(url);
      return 200 <= rsp.status < 400;
    } catch {
      return false;
    }
  }
}


async function* run(promises) {

}