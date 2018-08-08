const BCResponse = use('BCResponse');
const DBClient = use('DBClient');

bind('App/AuthMiddleware', function () {
  return async function (data, next) {
    const token = data.route.params.body.token;
    const collection = DBClient.collection('users');
    let foundUsers = [];

    if (!token) {
      return BCResponse.buildFromError(3001)(data.response);
    }

    try {
      foundUsers = await(await collection.find({ tokens: { $elemMatch: { value: token } } })).toArray();
      if (foundUsers.length) {
        next();
      } else {
        return BCResponse.buildFromError(3000)(data.response);
      }
    } catch (e) {
      console.error(e);
      return BCResponse.buildFromError(1, 'Trying to check if session exists')(data.response);
    }
  }
});
