require('dotenv').config();

const errorCodes = require('./errors.json');

class ResponseBuilder {
  /**
   * Builds a response handler with data and options.
   *
   * @param {*} data
   * @param {*} [options={}]
   * @returns {function}
   * @memberof ResponseBuilder
   */
  build (data, options = {}) {
    return (response) => {
      if (options.headers) {
        Object.keys(options.headers).forEach(key => {
          response.setHeader(key, options.headers[key]);
        })
      }
      response.setHeader('content-type', 'application/json');
      response.setHeader('Access-Content-Allow-Origin', '*');
      response.writeHead(options.status || 200);
      return response.end(JSON.stringify(data))
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
    return this.build({ status: 'ok', message })
  }

  /**
   * Builds a payload response.
   *
   * @param {*} payload
   * @returns {function}
   * @memberof ResponseBuilder
   */
  payload(payload) {
    return this.build({ payload })
  }

  /**
   * Builds an error response from error code with description.
   *
   * @param {*} code
   * @param {string} [description='']
   * @returns {function}
   * @memberof ResponseBuilder
   */
  buildFromError (code, description = '') {
    return this.build({
      error: errorCodes[`${code}`] + ((+env('DEBUG', 1) && description) ? ` (${description})` : '') || "Unknown error",
      code: code || 1
    }, {
      status: code < 100 ? 500 : 200
    })
  }
}

module.exports = ResponseBuilder
