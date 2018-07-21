module.exports = {
  /**
   * Load application providers.
   */
  'providers': [
    modules_path() + '/ivy-js/src/Config/ServiceProvider',
    modules_path() + '/ivy-js/src/Pipe/ServiceProvider',
    modules_path() + '/ivy-js/src/Middleware/ServiceProvider',
    modules_path() + '/ivy-js/src/Router/ServiceProvider',
    modules_path() + '/ivy-js/src/Console/ServiceProvider',
    app_path() + '/services/db/ServiceProvider',
    app_path() + '/services/response/ServiceProvider',
    app_path() + '/services/validator/ServiceProvider',
  ],

  /**
   * Create a desired aliases.
   */
  'alias': {
    'Config': 'Ivy/Config',
    'Router': 'Ivy/Router'
  }
};
