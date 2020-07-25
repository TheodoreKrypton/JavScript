'use strict'

const utils = require("./utils");
const ds = require("../ds");


const requester = utils.requester("https://api.avgle.com")

module.exports = {
  searchByCode: async (code) => {
    const rsp = await requester.get(`/v1/search/${code}/0?limit=1`);
    const video = rsp.data.response.videos[0];
    if (video.title.toLowerCase().includes(code.toLowerCase())) {
      const av = new ds.AV();
      av.title = video.title;
      av.video_url = video.video_url;
      av.code = code;
      av.preview_img_url = video.preview_url;
      return av;
    } else {
      return null;
    }
  }
}