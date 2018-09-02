module.exports = {
  /**
   * List of middleware in form of:
   * binding: namespace
   */
  'middlewares': {
    'body-parser': 'App/BodyParserMiddleware',
    'auth': 'App/AuthMiddleware',
    'check-db': 'App/CheckDBMiddleware',
  },

  /**
   * Group of middleware in form of:
   * binding: [list of bindings]
   */
  'groups': {
    'check-token': ['body-parser', 'auth']
  }
};
