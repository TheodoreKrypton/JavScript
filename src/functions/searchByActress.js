const sources = require("../sources");

const guessLang = (actress) => {
  for (let i = 0; i < actress.length; i++) {
    const charCode = actress.charCodeAt(i);
    if (charCode >= 128) {
      return "jp"
    }
  }
  return "en";
}

const searchByActress = async (ws, reqId, actress) => {
  const lang = guessLang(actress);
  if (lang === "en") {
    actress = await sources.warashiAsianPornstarsFr.translate2Jp(actress);
    if (!actress) {
      return;
    }
  }
  sources.warashiAsianPornstarsFr.getActressInfo(actress).then((rsp) => {
    ws.send(JSON.stringify({ response: rsp, reqId }))
  });
  [sources.indexav, sources.warashiAsianPornstarsFr].forEach((source) => {
    source.searchByActress(actress).then((rsp) => {
      if (!rsp) {
        return;
      }
      if (rsp.length > 0 && rsp[0] instanceof Promise) {
        rsp.forEach((r) => {
          r.then((response) => {
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
  searchByActress
}