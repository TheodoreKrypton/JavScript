'use strict'

const utils = require("./utils");
const ds = require("../ds");
const { JSDOM } = require("jsdom");


const requester = utils.requester("https://indexav.com");

const getInfoFromCard = (card) => {
  const av = new ds.AV();
  av.code = card.querySelector(".tag.is-link.is-light").textContent.trim();
  av.actress = [...card.querySelectorAll(".tag.is-primary.is-light")].map((tag) => {
    return tag.textContent.trim();
  })
  const h5 = card.querySelector(".title");
  av.title = h5.textContent.trim();
  av.preview_img_url = h5.querySelector("a").rel;
  av.release_date = utils.noexcept(() => { return card.querySelector("footer").querySelector("p").textContent.trim() });
  return av;
}

const searchByActressInPage = async (actress, n) => {
  const rsp = await requester.get(`/actor/${encodeURI(actress)}?page=${n}`);
  console.log(rsp.status);
  const dom = new JSDOM(rsp.data);
  const cards = [...dom.window.document.querySelectorAll(".video_column")];
  console.log(cards.length);
  return cards.map(getInfoFromCard);
}

const searchByActress = async (actress) => {
  const rsp = await requester.get(`/actor/${encodeURI(actress)}`);
  const dom = new JSDOM(rsp.data);
  const ul = dom.window.document.querySelector(".pagination-list");
  if (!ul) {
    return searchByActressInPage(actress, 1);
  } else {
    console.log([...ul.querySelectorAll("li")]);
    return [...ul.querySelectorAll("li")].map((li) => {
      const page = li.textContent.trim();
      return searchByActressInPage(actress, page);
    });
  }
}

module.exports = {
  searchByActress
};