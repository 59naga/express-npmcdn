Express NpmCDN
---

<p align="right">
  <a href="https://npmjs.org/package/express-unpkg">
    <img src="https://img.shields.io/npm/v/express-unpkg.svg?style=flat-square">
  </a>
  <a href="https://travis-ci.org/59naga/express-unpkg">
    <img src="http://img.shields.io/travis/59naga/express-unpkg.svg?style=flat-square">
  </a>
  <a href="https://codeclimate.com/github/59naga/express-unpkg/coverage">
    <img src="https://img.shields.io/codeclimate/github/59naga/express-unpkg.svg?style=flat-square">
  </a>
  <a href="https://codeclimate.com/github/59naga/express-unpkg">
    <img src="https://img.shields.io/codeclimate/coverage/github/59naga/express-unpkg.svg?style=flat-square">
  </a>
  <a href="https://gemnasium.com/59naga/express-unpkg">
    <img src="https://img.shields.io/gemnasium/mathiasbynens/he.svg?style=flat-square">
  </a>
</p>

> Hosting npm package files

[API Reference](https://unpkg.com/express-unpkg/docs/index.html)

Usage
---

```bash
npm install express --save
npm install cors --save
npm install compression --save
npm install express-unpkg --save
```

```js
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const unpkg = require('express-unpkg');

const port = process.env.PORT || 59798;
const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(compression());
app.use(unpkg(`${__dirname}/public/packages/`, {
  api: 'http://registry.npmjs.org', // tarbal source
  maxAge: 60 * 60 * 24 * 365, // one year
  extensions: ['', '.js', '.json', '.html'], // resolve extensions
}));
app.listen(port, () => {
  console.log(`unpkg is available on http://localhost:${port}!`);
});
```

becomes:

```bash
curl -I http://localhost:59798/jquery
# HTTP/1.1 302 Found
# Access-Control-Allow-Origin: *
# Location: /jquery@2.2.1/

curl -I http://localhost:59798/jquery@2.2.1/
# HTTP/1.1 200 OK
# Access-Control-Allow-Origin: *
# Content-Type: application/javascript
# Content-Length: 258549
#...
```

URL Format
---
* `/package-name` -> `latest version` / `main file`
* `/package-name/README.md` -> `latest version` / `README.md`
* `/package-name@version` -> `version` / `main file`
* `/package-name@version/lib/` -> `version` / `lib/index.js`
* `/package-name@version/docs/` -> `version` / `docs/index.html`

[DEMO](https://cdn.berabou.me/jquery/)

Test
---
```bash
git clone https://github.com/59naga/express-unpkg.git
cd express-unpkg

npm install
npm test
```

License
---
[MIT](http://59naga.mit-license.org/)