const { JSDOM } = require('jsdom');
const utils = require('./utils');
const ds = require('../ds');

const requester = utils.requester('http://www.javlibrary.com');
const regexes = {
  video: new RegExp(/<div class="video".+?<\/div><\/div>/g),
};

const getNewlyReleased = async (page) => {
  const [majors, dates] = await Promise.all([
    requester.get(`/ja/vl_newrelease.php?&mode=2&page=${page}`),
    requester.get(`/ja/vl_newrelease.php?list&mode=2&page=${page}`),
  ]);

  const results = majors.data.match(regexes.video).map((video) => {
    const av = new ds.AV();
    const dom = new JSDOM(video).window.document;

    av.preview_img_url = utils.noexcept(() => dom.querySelector('img').src.replace('ps.jpg', 'pl.jpg'));
    if (av.preview_img_url && !av.preview_img_url.startsWith('http')) {
      av.preview_img_url = `http:${av.preview_img_url}`;
    }
    av.code = utils.noexcept(() => dom.querySelector('.id').textContent.trim());
    av.title = utils.noexcept(() => dom.querySelector('.title').textContent.trim());
    return av;
  });

  const dom = new JSDOM(dates.data).window.document;
  dom.querySelector('.videotextlist').querySelectorAll('tr:not(.header)').forEach((tr, i) => {
    results[i].release_date = tr.querySelectorAll('td')[1].textContent.trim();
  });

  return results;
};

module.exports = {
  getNewlyReleased,
};
