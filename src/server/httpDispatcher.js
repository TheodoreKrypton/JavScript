const express = require('express');
const fs = require('fs');
const sha256 = require('js-sha256');
const cors = require('cors');
const auth = require('./authenticate');
const config = require('./config');
const { logger } = require('./log');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const beforeRequest = (req, res, next) => {
  logger.info({
    http: {
      ip: req.connection.remoteAddress,
      method: req.method,
      path: req.originalUrl,
      query: req.query,
      body: req.body,
    },
  });
  if (req.method !== 'POST' || req.originalUrl === '/auth_by_password') {
    next();
    return;
  }
  const { userpass } = req.body;
  if (!auth.checkToken(userpass)) {
    res.status(400);
    res.send('rejected');
    return;
  }
  next();
};

app.use(beforeRequest);

app.get('/', (req, res) => {
  console.log('Get index');
  fs.createReadStream('./index.html')
    .pipe(res);
});

// app.post('/', (req, res) => {
//   const { message } = req.body;
//   console.log('Regular POST message: ', message);
//   return res.json({
//     answer: 42,
//   });
// });

app.get('/redirect_to', (req, res) => {
  res.redirect(req.query.url);
});

app.post('/auth_by_password', (req, res) => {
  const ip = req.connection.remoteAddress;
  const { password } = req.body;
  if (!auth.checkIP(ip) || !auth.checkPassword(password)) {
    res.status(400);
    res.send('rejected');
    return;
  }

  const plain = [ip, password, new Date().time].join('/');
  const token = sha256.sha256(plain).slice(0, 24);
  auth.addToken(token);
  res.send(token);
});

app.post('/get_config', (req, res) => {
  const cfg = { ...config.config };
  cfg.password = '';
  res.send(JSON.stringify(cfg));
});

app.post('/update_config', (req, res) => {
  const cfg = { ...config.config };
  if (req.body.password !== '') {
    cfg['hashed-password'] = req.body.password;
  }
  cfg['ip-whitelist'] = req.body['ip-whitelist'];
  console.log(cfg);
  config.set(cfg);
  res.send('');
});

module.exports = app;
