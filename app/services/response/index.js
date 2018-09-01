require('dotenv').config();
const fs = require('fs');
const path = require('path');

const errorCodes = require('./errors.json');

const mimeType = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.eot': 'appliaction/vnd.ms-fontobject',
  '.ttf': 'aplication/font-sfnt'
};

class ResponseBuilder {
  /**
   * Builds a response handler with data and options.
   *
   * @param {*} data
   * @param {*} [options={}]
   * @returns {function}
   * @memberof ResponseBuilder
   */
  build(data, options = {}) {
    return (response) => {
      if (options.headers) {
        Object.keys(options.headers).forEach(key => {
          response.setHeader(key, options.headers[key]);
        })
      }
      response.setHeader('content-type', 'application/json');
      response.setHeader('Access-Content-Allow-Origin', '*');
      response.writeHead(options.status || 200);
      return response.end(JSON.stringify(data));
    }
  }

  /**
   * Builds a message response.
   *
   * @param {*} message
   * @returns {function}
   * @memberof ResponseBuilder
   */
  message(message) {
    return this.build({ status: 'ok', message });
  }

  /**
   * Builds a payload response.
   *
   * @param {*} payload
   * @returns {function}
   * @memberof ResponseBuilder
   */
  payload(payload) {
    return this.build({ payload });
  }

  /**
   * Builds an error response from error code with description.
   *
   * @param {*} code
   * @param {string} [description='']
   * @returns {function}
   * @memberof ResponseBuilder
   */
  buildFromError(code, description = '') {
    return this.build({
      error: errorCodes[`${code}`] + ((+env('DEBUG', 1) && description) ? ` (${description})` : '') || "Unknown error",
      code: code || 1
    }, {
      status: code < 100 ? 500 : 200
    })
  }

  /**
   * Serve static files.
   *
   * @param {string} pathname
   * @returns {function}
   * @memberof ResponseBuilder
   */
  serve(pathname) {
    return(response) => {
      fs.exists(pathname, function (exist) {
        if (!exist) {
          // if the file is not found, return 404
          response.statusCode = 404;
          response.end(`File ${pathname} not found!`);
          return;
        }
        // if is a directory, then look for index.html
        if (fs.statSync(pathname).isDirectory()) {
          pathname += '/index.html';
        }
        // read file from file system
        fs.readFile(pathname, function (err, data) {
          if (err) {
            response.statusCode = 500;
            response.end(`Error getting the file: ${err}.`);
          } else {
            // based on the URL path, extract the file extention. e.g. .js, .doc, ...
            const ext = path.parse(pathname).ext;
            // if the file is found, set Content-type and send data
            response.setHeader('Content-type', mimeType[ext] || 'text/plain');
            response.end(data);
          }
        });
      });
    }
  }
}

module.exports = ResponseBuilder
