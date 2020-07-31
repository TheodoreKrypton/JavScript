const { JSDOM } = require('jsdom');
const utils = require('./utils');
const ds = require('../ds');

const requester = utils.requester('https://www.javbus.com');

const regexes = {
  gid: new RegExp(/var gid = (\d+?);/),
  uc: new RegExp(/var uc = (\d+?);/),
  img: new RegExp(/var img = '(.+?)';/),
};

const searchMagnet = async (code) => {
  const rsp = await requester.get(`/${code}`);
  const gid = encodeURI(rsp.data.match(regexes.gid)[1]);
  const uc = encodeURI(rsp.data.match(regexes.uc)[1]);
  const img = encodeURI(rsp.data.match(regexes.img)[1]);
  const queryString = `gid=${gid}&lang=zh&img=${img}&uc=${uc}`;
  const headers = { Referer: `https://www.javbus.com/${code}` };
  const rsp2 = await requester.get(`/ajax/uncledatoolsbyajax.php?${queryString}`, { headers });
  const dom = new JSDOM(`<table>${rsp2.data}</table>`);
  const trs = dom.window.document.querySelectorAll('tr');
  return [...trs].map((tr) => {
    const magnet = new ds.Magnet();
    magnet.magnet = tr.querySelector('a').href;
    magnet.description = tr.querySelectorAll('td')[1].textContent.trim();
    return magnet;
  });
};

module.exports = {
  searchMagnet,
};
