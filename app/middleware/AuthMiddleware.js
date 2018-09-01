const $Response = use('ResponseService');
const $User = use('UserService');

bind('App/AuthMiddleware', function () {
  return async function (data, next) {
    data.route.params.headers = data.request.headers;
    data.route.params.token = (data.request.headers.authorization || '').replace('Bearer', '').trim();
    const token = data.route.params.token;
    let foundUser = null;

    if (!token) {
      return $Response.buildFromError(3001)(data.response);
    }

    try {
      foundUser = await $User.getUserFromToken(token);
      if (foundUser) {
        next();
      } else {
        return $Response.buildFromError(3000)(data.response);
      }
    } catch (e) {
      console.error(e);
      return $Response.buildFromError(1, 'Trying to check if session exists')(data.response);
    }
  }
});
