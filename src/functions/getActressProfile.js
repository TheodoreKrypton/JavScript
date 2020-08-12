const sources = require('../sources');
const utils = require('./utils');

const getActressProfile = (ws, reqId, actress) => {
  sources.warashiAsianPornstarsFr.getActressProfile(actress).then((rsp) => {
    if (rsp) {
      ws.send(JSON.stringify({ response: rsp, reqId }));
    } else {
      utils.notFound(ws, reqId);
    }
  }).catch(() => {
    utils.notFound(ws, reqId);
  });
};

module.exports = {
  getActressProfile,
};
