const sources = require('../sources');

const searchByCode = async (ws, reqId, code) => {
  let something = false;
  await Promise.allSettled([
    sources.javmost,
    sources.avgle,
    sources.youav,
    sources.highporn,
    sources.javhdporn,
  ].map((source) => source.searchByCode(code).then(async (rsp) => {
    if (!rsp) {
      return;
    }

    if (Array.isArray(rsp)) {
      await Promise.allSettled(rsp.map((av) => av.then((response) => {
        if (response) {
          something = true;
          ws.send(JSON.stringify({ response, reqId }));
        }
      })));
    } else {
      something = true;
      ws.send(JSON.stringify({ response: rsp, reqId }));
    }
  }).catch((err) => {
    console.error(err.message);
  })));
  if (!something) {
    ws.send(JSON.stringify({ response: 'not found', reqId }));
  }
};

module.exports = {
  searchByCode,
};
