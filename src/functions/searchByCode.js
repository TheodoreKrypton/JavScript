const sources = require("../sources");

const searchByCode = (ws, reqId, code) => {
  [sources.javmost, sources.avgle].forEach((source) => {
    source.searchByCode(code).then((rsp) => {
      if (!rsp) {
        return;
      }
      if (Array.isArray(rsp)) {
        rsp.forEach((av) => {
          av.then((response) => {
            if (response) {
              ws.send(JSON.stringify({ response, reqId }));
            }
          })
        })
      } else {
        ws.send(JSON.stringify({ response: rsp, reqId }));
      }
    });
  })
}

module.exports = {
  searchByCode
}