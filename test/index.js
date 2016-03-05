import npmcdn from '../src';
import path from 'path';
import del from 'del';
import express from 'express';
import caravan from 'caravan';
import request from 'request';
import assert from 'power-assert';

// Environment
const port = process.env.PORT || 59798;
const url = `http://localhost:${port}`;
const cwd = path.join(__dirname, '..', 'public');
const options = {
  extensions: ['', '.js', '.json', '.html'],
};

// Specs
describe('cdn', () => {
  let server;
  before((done) => {
    del.sync(cwd);

    const app = express();
    app.use(npmcdn(cwd, options));

    server = app.listen(port, done);
  });
  after((done) => {
    server.close(done);
  });

  it('response 200 per 100 request(concurrent)', () => {
    const urls = [];

    const concurrency = 100;
    for (let i = 0; i < concurrency; i++) {
      urls.push(`${url}/climb-lookup/esdoc/badge.svg`);
    }

    return caravan(urls, { concurrency, raw: true })
    .then((responses) => {
      responses.forEach((response) => {
        assert(response.status === 200);
        assert(response.request.url === `${url}/climb-lookup@1.0.0/esdoc/badge.svg`);
        assert(response.body.toString('utf8').slice(0, 4) === '<svg');
      });
    });
  });

  it('default response the `package/main`', (done) => {
    request(`${url}/climb-lookup/`, (error, response) => {
      assert(response.body.slice(0, 12) === "'use strict'");
      done();
    });
  });
});
