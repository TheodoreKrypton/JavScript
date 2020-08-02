const functions = require('../functions');
const auth = require('./authenticate');

const dispatch = (ws, msg) => {
  console.log(msg);
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
    default:
      break;
  }
};

module.exports = {
  dispatch,
};
