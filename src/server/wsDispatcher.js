'use strict'

const sources = require("../sources");
const functions = require("../functions");

const dispatch = (ws, msg) => {
  console.log(msg);
  const { message, reqId } = msg;
  const { api, args } = message;
  switch (api) {
    case "search_by_code": {
      functions.searchByCode(ws, reqId, args.code);
      break;
    }
    case "get_newly_released": {
      functions.getNewlyReleased(ws, reqId, args.page);
      break;
    }
    case "search_by_actress": {
      functions.searchByActress(ws, reqId, args.actress);
      break;
    }
    default:
      break;
  }
}

module.exports = {
  dispatch
}