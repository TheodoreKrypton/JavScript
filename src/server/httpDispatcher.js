const express = require('express');

const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/', (req, res) => {
  console.log('Get index');
  fs.createReadStream('./index.html')
    .pipe(res);
});

app.post('/', (req, res) => {
  const { message } = req.body;
  console.log('Regular POST message: ', message);
  return res.json({
    answer: 42,
  });
});

app.get('/redirect_to', (req, res) => {
  res.redirect(req.query.url);
});

module.exports = app;
