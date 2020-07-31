const sources = require('../sources');

const getBrief = (ws, reqId, code) => {
  sources.indexav.getBrief(code).then((response) => {
    if (response) {
      ws.send(JSON.stringify({ response, reqId }));
    }
  });
};

module.exports = {
  getBrief,
};
