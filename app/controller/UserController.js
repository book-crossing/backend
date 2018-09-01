const $Misc = use('MiscService');
const $DB = use('DBService');
const $User = use('UserService');
const $Response = use('ResponseService');
const $Validator = use('ValidatorService');
const $Config = use('Config');

const showFields = [
  'username',
  'registeredAt',
  'info'
]

/**
 * Controller for handling user specific requests
 * register, login
 *
 * @class UserController
 */
class UserController {

  /**
   * Custom method for validating "not empty" value
   *
   * @param {*} val
   * @returns {boolean}
   * @memberof UserController
   */
  customNotEmptyValidator (val) {
    return (typeof val === 'string' ? !!(val.trim()) : !!val);
  }

  async index(params) {
    let username = params.username;

    try {
      let foundUsers = await $User.findUsers({ username });

      if (foundUsers.length) {
        let user = foundUsers[0];
        let result = {};

        showFields.forEach(el => {
          result[el] = user[el];
        });

        return $Response.message(result);
      } else {
        return $Response.buildFromError(1005);
      }

    } catch (e) {
      console.error(e);
      return $Response.buildFromError(1, 'Trying to get user data. ' + e.message);
    }
  }

  /**
   * User register method
   *
   * @param {*} params
   * @returns {*} Response
   * @memberof UserController
   */
  async register(params) {
    let username = params.body.username;
    let password = params.body.password;
    let phone = params.body.phone;
    let name = params.body.name;
    let errorCode = 0;

    errorCode = $Validator.validate(username, [
      [this.customNotEmptyValidator, 1002],
      [$Validator.isString, 1000],
      [val => val.length > 2, 1003],
      [/^[a-zа-я0-9]+$/i, 1004],
    ]);

    errorCode = errorCode || $Validator.validate(password, [
      [this.customNotEmptyValidator, 2001],
      [$Validator.isString, 2000],
      [val => val.length > 5, 2002]
    ]);

    if (errorCode) {
      return $Response.buildFromError(errorCode);
    }

    username = username.trim();
    password = $Misc.sha512(password.trim(), $Config.get('app.salt'));

    // check if username is taken
    try {
      let foundUsers = await $User.findUsers({ username });

      if (foundUsers.length) {
        return $Response.buildFromError(1001);
      }
    } catch (e) {
      console.error(e);
      return $Response.buildFromError(1, 'Trying to check if username is taken. ' + e.message);
    }

    // add new user
    try {
      let ts = Math.round((new Date()).getTime() / 1000);
      let insertionResult = await $User.collection.insertOne({
        username,
        password,
        tokens: [],
        registeredAt: ts,
        info: {
          phone,
          name
        }
      });

      if (!insertionResult.result.ok) {
        return $Response.buildFromError(11);
      }
    } catch (e) {
      console.error(e);
      return $Response.buildFromError(1, 'Trying to insert new user data. ' + e.message);
    }

    return $Response.message('Registered successfuly');
  }

  /**
   * User login method
   *
   * @param {*} params
   * @returns {*} Response
   * @memberof UserController
   */
  async login (params) {
    let username = params.body.username;
    let password = params.body.password;
    let errorCode = 0;
    let foundUsers = [];

    // check if user exists
    try {
      foundUsers = await $User.findUsers({ username });

      if (!foundUsers.length) {
        return $Response.buildFromError(1005);
      }
    } catch (e) {
      console.error(e);
      return $Response.buildFromError(1, 'Trying to check if user exists. ' + e.message);
    }

    errorCode = $Validator.validate(password, [
      [this.customNotEmptyValidator, 2001],
      [$Validator.isString, 2000]
    ]);

    if (errorCode) {
      return $Response.buildFromError(errorCode);
    }

    password = $Misc.sha512(password.trim(), $Config.get('app.salt'));

    if (password === foundUsers[0].password) {
      // generate and attach new token
      let newToken;
      try {
        let ts = Math.round((new Date()).getTime() / 1000);
        newToken = $Misc.sha512(`${$Config.get('app.tokensalt')}${ts}`, $Config.get('app.salt'));
        await $User.collection.updateOne({ username }, { $addToSet: { tokens: { value: newToken, date: ts } } });
      } catch (e) {
        console.error(e);
        return $Response.buildFromError(1, 'Trying to set new token. ' + e.message);
      }

      return $Response.build({
        token: newToken
      });
    } else {
      return $Response.buildFromError(2003);
    }
  }

  /**
   * User logout method
   *
   * @param {*} params
   * @returns {*} Response
   * @memberof UserController
   */
  async logout (params) {
    try {
      let token = params.token;
      let isRemoved = await $User.removeToken(token);

      if (!isRemoved) {
        return $Response.buildFromError(3000);
      }

      return $Response.message('Logged out successfuly');
    } catch (e) {
      return $Response.buildFromError(1, 'Trying to remove token. ' + e.message);
    }
  }
}

namespace('App/Controller/UserController', UserController);
