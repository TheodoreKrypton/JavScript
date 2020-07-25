'use strict'

const utils = require("./utils");
const ds = require("../ds");
const { JSDOM } = require("jsdom");
const { noexcept } = require("./utils");


const requester = utils.requester("http://warashi-asian-pornstars.fr");
const actressDetailUrl = {};

const searchByActress = async (actress) => {
  const actressLower = actress.toLowerCase();
  if (actressDetailUrl[actressLower] === undefined) {
    await translate2Jp(actress);
  }
  if (!actressDetailUrl[actressLower]) {
    return [];
  }
  const rsp = await requester.get(actressDetailUrl[actressLower].replace("/s-2-0/", "/s-2-4/"));
  const dom = new JSDOM(rsp.data);
  let trs = [...dom.window.document.querySelector("table").querySelectorAll("tr")];
  const res = trs.slice(1, trs.length).map(getBriefFromTr);
  return res;
}

const getBriefFromTr = (tr) => {
  const av = new ds.AV();
  av.preview_img_url = noexcept(() => { return tr.getAttribute("data-img"); });
  if (av.preview_img_url && av.preview_img_url.startsWith("/")) {
    av.preview_img_url = `http://warashi-asian-pornstars.fr${av.preview_img_url}`.replace("/mini/", "/large/");
  }
  const tds = [...tr.querySelectorAll("td")];
  av.title = tds[1].textContent.trim();
  av.code = tds[2].textContent.toUpperCase();
  av.release_date = tds[5].textContent.trim();
  return av;
}

const translate2Jp = async (actress) => {
  const payload = `recherche_critere=f&recherche_valeur=${encodeURIComponent(actress)}`;
  const rsp = await requester.post("/en/s-12/search", payload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  const dom = new JSDOM(rsp.data);
  const actressLower = actress.toLowerCase();

  let name = null;

  name = getNameInCard(actressLower, dom.window.document.querySelector(".bloc-resultats"));
  if (name) {
    return name;
  }

  name = getNameInCard(dom.window.document.querySelector("#bloc-resultats-conteneur-pornostars").querySelector(".resultat-pornostar"));
  if (name) {
    return name;
  }

  name = getNameInCard(dom.window.document.querySelector("#bloc-resultats-conteneur-castings").querySelector(".resultat-pornostar"));
  if (name) {
    return name;
  }

  actressDetailUrl[name] = null;
  return null;
}

const getNameInCard = (name, card) => {
  if (!card) {
    return null;
  }

  if (!card.textContent.toLowerCase().includes(name)) {
    return null;
  }

  const title = card.querySelector("p").textContent.toLowerCase();

  const jpName = title.split("-")[1].trim();
  if (jpName.length === 0) {
    return null;
  }

  // cache for parsing actress info later, None for no url
  const url = noexcept(() => { return card.querySelector("a").href });
  actressDetailUrl[name] = url;
  actressDetailUrl[jpName] = url;

  return jpName;
}

module.exports = {
  searchByActress,
  translate2Jp
};