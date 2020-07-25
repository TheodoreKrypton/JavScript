const sources = require("../sources");

const getNewlyReleased = (ws, reqId, page) => {
  sources.javmost.getNewlyReleased(page).then((response) => {
    if (response) {
      ws.send(JSON.stringify({ response, reqId }));
    }
  })
}

module.exports = {
  getNewlyReleased
}