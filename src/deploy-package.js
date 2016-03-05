import mkdirp from 'mkdirp';
import gunzip from 'gunzip-maybe';
import tar from 'tar-fs';
import request from 'request';
import fsOrigin from 'fs';
import Bluebird from 'bluebird';

// Transform to promise functions
const mkdirpAsync = Bluebird.promisify(mkdirp);
const fs = Bluebird.promisifyAll(fsOrigin);

const progressTasks = {};

/**
* Download and extract the package tarball
*
* @function deployPackage
* @param {string} url - from download tarball url
* @param {string} dist - to extract directory
* @return {promise} task - fulfill is deployment the complete
*/
export default (url, dist) => {
  if (progressTasks[url]) {
    return progressTasks[url];
  }

  progressTasks[url] =
    fs.accessAsync(dist)
    .catch(() => (
      mkdirpAsync(dist)
      .then(() => (
        new Bluebird((resolve, reject) => {
          request(url)
          .pipe(gunzip())
          .pipe(tar.extract(dist, {
            map: (header) => {
              // remove `package` directory
              // 'package/package.json' => 'package.json'

              /* eslint-disable no-param-reassign */
              header.name = header.name.replace(/^package\//, '');
              /* eslint-enable no-param-reassign */

              return header;
            },
          }))
          .on('finish', resolve)
          .on('error', reject);
        })
      ))
    ));

  return progressTasks[url];
};
