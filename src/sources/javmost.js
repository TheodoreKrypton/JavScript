'use strict'

const utils = require("./utils");
const ds = require("../ds");
const jsdom = require("jsdom");
const { default: Axios } = require("axios");
const { AV } = require("../ds");
const { noexcept } = require("./utils");
const { JSDOM } = jsdom;


const requester = utils.requester("https://www5.javmost.com");

const regexes = {
  var_value: new RegExp(/'value':(.+?),/),
  sound: new RegExp(/'sound':'(.+?)'/),
  params: new RegExp(/select_part\((.+?)\)/),
  quote: new RegExp(/'/g),
  date: new RegExp(/\d\d\d\d-\d\d-\d\d/)
}

const try_one_button = async (button, value, sound) => {
  const params = button.querySelector("a").getAttribute('onclick').match(regexes.params)[1];
  const tokens = params.split(",");

  const [part, group, , , code, code2, code3] = tokens.map((token) => {
    return encodeURIComponent(token.replace(regexes.quote, ""));
  })

  const data = `group=${group}&part=${part}&code=${code}&code2=${code2}&code3=${code3}&value=${value}&sound=${sound}`;
  const rsp = await requester.post("/get_movie_source/", data, {
    headers: {
      'content-type': "application/x-www-form-urlencoded; charset=UTF-8"
    }
  });

  const url = rsp.data.data[0].trim();
  if (url.includes("avgle")) {
    const rsp = await Axios.get(url);
    if (rsp.data.includes("This video is not available on this platform.")) {
      return null;
    }
  }

  if (url.endsWith(".m3u8") || url.endsWith(".mp4")) {
    return url;
  }

  if (await utils.testUrl(url)) {
    return url;
  } else {
    return null;
  }
}

const searchByCode = async (code) => {
  const rsp = await requester.get(`/${code}/`);
  const dom = new JSDOM(rsp.data);

  let previewImgUrl = utils.noexcept(() => {
    return dom.window.document.querySelector('meta[property="og:image"]').content
  });

  let title = utils.noexcept(() => {
    return dom.window.document.querySelector('meta[property="og:description"]').content
  });

  let releaseDate = utils.noexcept(() => {
    return dom.window.document.querySelector('meta[property="video:release_date"]').content.slice(0, 10);
  });

  let actress = [...dom.window.document.querySelectorAll('a.btn-danger:not(.btn-circle)')].map((button) => {
    return button.textContent;
  });

  if (!previewImgUrl.startsWith("http:")) {
    previewImgUrl = `http:${previewImgUrl}`;
  }
  let buttons = [...dom.window.document.querySelector(".tab-overflow").querySelectorAll("li")];
  buttons = buttons.slice(1, buttons.length - 1);
  const var_value = rsp.data.match(regexes.var_value)[1];
  const value = encodeURIComponent(rsp.data.match(`var ${var_value} = '(.+?)'`)[1]);
  const sound = rsp.data.match(regexes.sound)[1];

  return buttons.map((button) => {
    return (async () => {
      const url = await try_one_button(button, value, sound);
      if (url) {
        const av = new ds.AV();
        av.preview_img_url = previewImgUrl;
        av.video_url = url;
        av.code = code;
        av.title = title;
        av.release_date = releaseDate;
        av.actress = actress;
        return av;
      } else {
        return null;
      }
    })()
  })
}

const getNewlyReleased = async (page) => {
  const rsp = await requester.get(`/showlist/new/${page}/release`);
  const html = rsp.data.data;
  const dom = new JSDOM(html);
  return [...dom.window.document.querySelectorAll(".card")].map((card) => {
    const releaseDate = noexcept(() => {
      return card.textContent.match(regexes.date)[0];
    });
    const actress = [...card.querySelectorAll(".btn-danger")].map((button) => {
      return button.textContent;
    });
    let previewImgUrl = noexcept(() => {
      return card.querySelector("img").getAttribute("data-src");
    });
    if (!previewImgUrl.startsWith("http")) {
      previewImgUrl = `http:${previewImgUrl}`;
    }
    const av = new ds.AV();
    av.preview_img_url = previewImgUrl;
    av.title = noexcept(() => {
      return card.querySelector("h5").textContent.trim();
    });
    av.actress = actress;
    av.release_date = releaseDate;
    av.code = card.querySelector("h4").textContent.trim();
    return av;
  })
}

module.exports = {
  searchByCode,
  getNewlyReleased,
};
