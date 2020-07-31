const sources = require('../sources');

const guessLang = (actress) => {
  for (let i = 0; i < actress.length; i += 1) {
    const charCode = actress.charCodeAt(i);
    if (charCode >= 128) {
      return 'jp';
    }
  }
  return 'en';
};

const searchByActress = async (ws, reqId, actress) => {
  const lang = guessLang(actress);
  if (lang === 'en') {
    // eslint-disable-next-line no-param-reassign
    actress = await sources.warashiAsianPornstarsFr.translate2Jp(actress);
    if (!actress) {
      ws.send(JSON.stringify({ response: 'not found', reqId }));
    }
  }
  sources.warashiAsianPornstarsFr.getActressInfo(actress).then((rsp) => {
    ws.send(JSON.stringify({ response: rsp, reqId }));
  });

  let something = false;
  await Promise.allSettled([
    sources.indexav,
    sources.warashiAsianPornstarsFr,
  ].map((source) => source.searchByActress(actress).then(async (rsp) => {
    if (!rsp) {
      return;
    }
    if (rsp.length > 0 && rsp[0] instanceof Promise) {
      await Promise.allSettled(rsp.map((r) => r.then((response) => {
        if (response) {
          something = true;
          ws.send(JSON.stringify({ response, reqId }));
        }
      })));
    } else {
      something = true;
      ws.send(JSON.stringify({ response: rsp, reqId }));
    }
  })));
  if (!something) {
    ws.send(JSON.stringify({ response: 'not found', reqId }));
  }
};

module.exports = {
  searchByActress,
};
