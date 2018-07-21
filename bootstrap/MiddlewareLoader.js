let middlewareList = require('../config/middleware'),
    Container = use('Ivy/MiddlewareContainer');

/**
 * Register middleware from list.
 */
Container.registerMiddleware(middlewareList.middlewares);

/**
 * Register groups from list.
 */
Container.registerGroup(middlewareList.groups);