const process = require('process'),
      path = require('path');

/**
 * Returns a path to the node_modules dir.
 *
 * @return {*}
 */
global.modules_path = function () {
  return path.join(process.cwd(), 'node_modules');
};

/**
 * Returns a path to the app dir.
 *
 * @return {*}
 */
global.app_path = function () {
  return path.join(process.cwd(), 'app');
};

let Helper = use('Ivy/Helper');

require('./ServiceLoader');
require('./ConfigLoader');
Helper.requireFromFolder('/app/middleware');
Helper.requireFromFolder('/app/controller');
require('./MiddlewareLoader');
require('../routes/routes');
