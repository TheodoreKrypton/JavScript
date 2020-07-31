const axios = require('axios');
const http = require('http');
const https = require('https');
const { default: Axios } = require('axios');

const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36 Edg/84.0.522.48';

module.exports = {
  requester: (baseUrl) => {
    const requester = axios.create({
      timeout: 60000,
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true }),
    });
    return {
      get(url, config) {
        const u = url.startsWith('http') ? url : `${baseUrl}${url}`;
        return requester.get(u, {
          headers: {
            'User-Agent': ua,
          },
          ...config,
        });
      },

      post(url, data, config) {
        const u = url.startsWith('http') ? url : `${baseUrl}${url}`;
        return requester.post(u, data, {
          headers: {
            'User-Agent': ua,
          },
          ...config,
        });
      },
    };
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
      return rsp.status >= 200 < 400;
    } catch {
      return false;
    }
  },
};
