let parser = require('get-body');
bind('App/BodyParserMiddleware', function () {
  return function (data, next) {
    parser.parse(data.request, data.request.headers).then((body) => {
      data.route.params['body'] = body;
      next();
    }).catch((exception) => {
      next(exception);
    });
  }
});
