const sources = require('../sources');
const utils = require('./utils');

const searchMagnet = (ws, reqId, code) => {
  sources.javbus.searchMagnet(code).then((response) => {
    if (response) {
      ws.send(JSON.stringify({ response, reqId }));
    } else {
      utils.notFound(ws, reqId);
    }
  });
};

module.exports = {
  searchMagnet,
};
