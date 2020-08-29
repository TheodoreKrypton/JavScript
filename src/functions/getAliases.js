const sources = require('../sources');
const utils = require('./utils');

const getAliases = (ws, reqId, { actress }) => {
  sources.warashiAsianPornstarsFr.getAliases(actress).then((rsp) => {
    if (rsp) {
      ws.send(JSON.stringify({ response: rsp, reqId }));
    } else {
      utils.notFound(ws, reqId);
    }
  });
};

module.exports = {
  getAliases,
};
