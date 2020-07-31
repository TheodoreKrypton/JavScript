const { JSDOM } = require('jsdom');
const utils = require('./utils');
const ds = require('../ds');
const { noexcept } = require('./utils');

const requester = utils.requester('http://warashi-asian-pornstars.fr');
const actressDetailUrl = {};

const getNameInCard = (name, card) => {
  if (!card) {
    return null;
  }
  if (!card.textContent.toLowerCase().includes(name)) {
    return null;
  }

  const title = card.querySelector('p').textContent.toLowerCase();

  const jpName = title.split('-')[1].trim();
  if (jpName.length === 0) {
    return null;
  }

  // cache for parsing actress info later, None for no url
  const url = noexcept(() => card.querySelector('a').href);
  actressDetailUrl[name] = url;
  actressDetailUrl[jpName] = url;

  return jpName;
};

const translate2Jp = async (actress) => {
  const payload = `recherche_critere=f&recherche_valeur=${encodeURIComponent(actress)}`;
  const rsp = await requester.post('/en/s-12/search', payload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const dom = new JSDOM(rsp.data);
  const actressLower = actress.toLowerCase();

  let name = getNameInCard(actressLower, dom.window.document.querySelector('.bloc-resultats'));
  if (name) {
    return name;
  }

  name = getNameInCard(actressLower, dom.window.document.querySelector('#bloc-resultats-conteneur-pornostars').querySelector('.resultat-pornostar'));
  if (name) {
    return name;
  }

  name = getNameInCard(actressLower, dom.window.document.querySelector('#bloc-resultats-conteneur-castings').querySelector('.resultat-pornostar'));
  if (name) {
    return name;
  }

  actressDetailUrl[name] = null;
  return null;
};

const getBriefFromTr = (tr) => {
  const av = new ds.AV();
  av.preview_img_url = noexcept(() => tr.getAttribute('data-img'));
  if (av.preview_img_url && av.preview_img_url.startsWith('/')) {
    av.preview_img_url = `http://warashi-asian-pornstars.fr${av.preview_img_url}`.replace('/mini/', '/large/');
  }
  const tds = [...tr.querySelectorAll('td')];
  av.title = tds[1].textContent.trim();
  av.code = tds[2].textContent.toUpperCase();
  av.release_date = tds[5].textContent.trim();
  return av;
};

const searchByActress = async (actress) => {
  const actressLower = actress.toLowerCase();
  if (actressDetailUrl[actressLower] === undefined) {
    await translate2Jp(actress);
  }
  if (!actressDetailUrl[actressLower]) {
    return [];
  }
  const rsp = await requester.get(actressDetailUrl[actressLower].replace('/s-2-0/', '/s-2-4/'));
  const dom = new JSDOM(rsp.data);
  const trs = [...dom.window.document.querySelector('table').querySelectorAll('tr')];
  const res = trs.slice(1, trs.length).map(getBriefFromTr);
  return res;
};

const parseDetailPage = async (url) => {
  const rsp = await requester.get(url);
  const dom = new JSDOM(rsp.data);
  const actressInfo = new ds.Actress();
  let img = dom.window.document.querySelector('#pornostar-profil-photos');
  if (img) {
    actressInfo.img = `http://warashi-asian-pornstars.fr/${img.querySelector('img').src}`;
  } else {
    img = dom.window.document.querySelector('#casting-profil-preview');
    if (img) {
      actressInfo.img = `http://warashi-asian-pornstars.fr${img.querySelector('img').src}`;
    }
  }

  const infoField = dom.window.document.querySelector('#pornostar-profil-infos');

  if (!infoField) {
    return null;
  }

  const aliases = new Set();
  const h1 = dom.window.document.querySelector('h1');
  const mainName = h1.querySelectorAll('span')[1].textContent;
  aliases.add(mainName);

  const div = infoField.querySelector('#pornostar-profil-noms-alternatifs');
  if (div) {
    const names = [...div.querySelectorAll('li')].map((li) => {
      const spans = li.querySelectorAll('span');
      if (spans.length === 0) {
        return null;
      }
      return spans[1].textContent.trim();
    }).filter((x) => x !== null);
    names.forEach((name) => {
      aliases.add(name);
    });
  }

  actressInfo.aliases = [...aliases];
  const ps = infoField.querySelectorAll('p');
  ps.forEach((p) => {
    if (p.textContent.includes('birthdate')) {
      actressInfo.birth_date = p.querySelector('time').getAttribute('content');
    }
    if (p.getAttribute('itemprop')) {
      if (p.getAttribute('itemprop') === 'height') {
        actressInfo.height = p.querySelector('span').textContent.trim();
      } else if (p.getAttribute('itemprop') === 'weight') {
        actressInfo.weight = p.querySelector('span').textContent.trim();
      }
    }
  });
  return actressInfo;
};

const getActressInfo = async (actress) => {
  const actressLower = actress.toLowerCase();
  if (actressDetailUrl[actressLower] === undefined) {
    await translate2Jp(actress);
  }
  if (actressDetailUrl[actressLower] === null) {
    return null;
  }
  return parseDetailPage(actressDetailUrl[actressLower]);
};

module.exports = {
  searchByActress,
  translate2Jp,
  getActressInfo,
};
