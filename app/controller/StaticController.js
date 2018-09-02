const $Response = use('ResponseService');

class StaticController {

  /**
   * Render a file in response.
   *
   * @param {*} params
   * @returns {*} Response
   * @memberof StaticController
   */
  render(params) {
    let type = params.type || '';
    let filepath = params.file || 'index.html';
    return $Response.serve(`./app/static/${type}/${filepath}`);
  }
}

namespace('App/Controller/StaticController', StaticController);
