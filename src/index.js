import express from 'express';
import deployPackage from './deploy-package';
import resolveFileName from './resolve-filename';
import path from 'path';
import objectAssign from 'object-assign';
import Bluebird from 'bluebird';
import request from 'request';
import fsOrigin from 'fs';

// Transform to promise functions
const requestAsync = Bluebird.promisify(request);
const fs = Bluebird.promisifyAll(fsOrigin);

/**
* create npmcdn middleware
*
* @function expressNpmcdn
* @param {string} cwd - a package extract base path
* @param {object} [options]
* @param {object} [options.api] - tarball source
* @param {object} [options.extensions] - see resolveFileName
* @param {object} [options.maxAge] - send max age header
* @return {Router} npmcdn - see http://expressjs.com/ja/api.html#router
*/
export default (cwd, options = {}) => {
  const npmcdn = express.Router();
  const opts = objectAssign({
    api: 'http://registry.npmjs.org',
    maxAge: 60 * 60 * 24 * 365, // one year
  }, options);

  // Fetch the request file or main
  npmcdn.use('/:name@:version', (req, res) => {
    const { name, version } = req.params;
    const url = `${opts.api}/${name}/-/${name}-${version}.tgz`;
    const file = req.url.slice(1);
    const dist = path.join(cwd, name, version);
    const resolveFileNameOpts = objectAssign(opts, { dist });

    if (file) {
      return deployPackage(url, dist)
      .then(() => resolveFileName(file, resolveFileNameOpts))
      .then((fileName) => {
        res.sendFile(fileName, { maxAge: opts.maxAge });
      })
      .catch((error) => {
        res.status(500).end(error.message);
      });
    }

    return deployPackage(url, dist)
    .then(() => fs.readFileAsync(path.join(dist, 'package.json')))
    .then((json) => JSON.parse(json))
    .then((data) => resolveFileName(data.main || 'index', opts))
    .then((mainFile) => {
      res.sendFile(mainFile, { maxAge: opts.maxAge });
    })
    .catch((error) => {
      res.status(500).end(error.message);
    });
  });
  
  // Redirect to latest version
  npmcdn.use('/:name', (req, res) => {
    const { name } = req.params;

    requestAsync(`${opts.api}/${name}`)
    .then((response) => {
      const packageInfo = JSON.parse(response.body);
      if (packageInfo.name) {
        const version = packageInfo['dist-tags'].latest;

        return res.redirect(`/${name}@${version}${req.url}`);
      }

      return res.status(404).end(`Notfound package: ${name}`);
    })
    .catch((error) => {
      res.status(500).end(error.message);
    });
  });

  return npmcdn;
};
