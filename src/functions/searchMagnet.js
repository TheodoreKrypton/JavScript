const sources = require('../sources');

const searchMagnet = (ws, reqId, code) => {
  sources.javbus.searchMagnet(code).then((response) => {
    if (response) {
      ws.send(JSON.stringify({ response, reqId }));
    }
  });
};

module.exports = {
  searchMagnet,
};
