const sources = require('../sources');
const utils = require('./utils');

const getNewlyReleased = (ws, reqId, { page }) => {
  [sources.javlibrary, sources.javmost].forEach(
    (source) => source.getNewlyReleased(page).then((response) => {
      if (response) {
        ws.send(JSON.stringify({ response, reqId }));
      }
    }).catch((err) => {
      utils.notFound(ws, reqId);
      throw err;
    }),
  );
};

module.exports = {
  getNewlyReleased,
};
