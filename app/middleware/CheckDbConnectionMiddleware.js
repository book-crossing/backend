const $Response = use('ResponseService');
const $DB = use('DBService');

bind('App/CheckDBMiddleware', function () {
  return async function (data, next) {
    if ($DB.isConnected) {
      next();
    } else {
      return $Response.buildFromError(10);
    }
  }
});
