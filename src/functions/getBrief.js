const sources = require('../sources');
const utils = require('./utils');

const getBrief = (ws, reqId, code) => {
  sources.indexav.getBrief(code).then((response) => {
    if (response) {
      ws.send(JSON.stringify({ response, reqId }));
    } else {
      utils.notFound(ws, reqId);
    }
  });
};

module.exports = {
  getBrief,
};
