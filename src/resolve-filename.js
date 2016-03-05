import Bluebird from 'bluebird';
import objectAssign from 'object-assign';
import fs from 'fs';
import path from 'path';

/**
* lookup file with extensions in dist
* eg: resolveFileName('foo') -> 'foo.js' or 'foo.json'
*
* @function resolveFileName
* @param {string} file - lookup filename
* @param {object} [options]
* @param {object} [options.dist] - a base path
* @param {object} [options.extensions] - lookup file extensions
* @return {promise} fileName - fulfill is lookedup file
*/
const resolveFileName = (file, options = {}, callback) => {
  const opts = objectAssign({
    dist: process.cwd(),
    extensions: ['', '.js', '.json'],
  }, options);

  opts.extensions.reduceRight((next, ext) => () => {
    const fileName = path.join(opts.dist, `${file}${ext}`);

    fs.stat(fileName, (error, stat) => {
      if (stat && stat.isFile()) {
        callback(null, fileName);
      } else if (stat && stat.isDirectory()) {
        resolveFileName(path.join(file, 'index'), opts, callback);
      } else if (error && error.code !== 'ENOENT') {
        callback(error);
      } else {
        next();
      }
    });
  }, () => {
    callback(new Error(`no such file: ${file}`));
  })();
};
export default Bluebird.promisify(resolveFileName);
