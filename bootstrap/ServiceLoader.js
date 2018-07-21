let services = require('../config/services');

/**
 * Load providers
 */
services.providers.forEach((provider) => {
  require(provider);
});

/**
 * Create aliases.
 */
for (let key in services.alias) {
  alias(key, services.alias[key]);
}
