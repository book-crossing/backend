let Config = use('Config');

/**
 * Load Environment file.
 */
Config.loadEnvConfigs();

/**
 * Load configs from files.
 */
Config.loadConfig('app', require('../config/app'));