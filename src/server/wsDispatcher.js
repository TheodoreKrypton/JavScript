const functions = require('../functions');
const auth = require('./authenticate');
const { logger } = require('./log');

const dispatch = (ws, msg) => {
  logger.info({ ws: msg });

  try {
    const { message, reqId, userpass } = msg;

    if (!auth.checkToken(userpass)) {
      return;
    }

    const { api, args } = message;
    switch (api) {
      case 'search_by_code': {
        functions.searchByCode(ws, reqId, args.code);
        break;
      }
      case 'get_newly_released': {
        functions.getNewlyReleased(ws, reqId, args.page);
        break;
      }
      case 'search_by_actress': {
        functions.searchByActress(ws, reqId, args.actress);
        break;
      }
      case 'search_magnet_by_code': {
        functions.searchMagnet(ws, reqId, args.code);
        break;
      }
      case 'get_aliases': {
        functions.getAliases(ws, reqId, args.actress);
        break;
      }
      case 'get_actress_profile': {
        functions.getActressProfile(ws, reqId, args.actress);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    logger.error(err.message);
  }
};

module.exports = {
  dispatch,
};
