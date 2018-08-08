const DBClient = use('DBClient');
const BCResponse = use('BCResponse');
const BCValidator = use('BCValidator');
const Config = use('Config');

const crypto = require('crypto');

/**
 * Controller for handling user specific requests
 * register, login
 *
 * @class UserController
 */
class UserController {

  constructor () {
    this.collection = DBClient.collection('users');
  }

  /**
   * SHA512 hash generator
   *
   * @param {string} val
   * @returns {string} Hash
   * @memberof UserController
   */
  sha512 (val) {
    try {
      let hash = crypto.createHmac('sha512', Config.get('app.salt')); /** Hashing algorithm sha512 */
      hash.update(val);
      return hash.digest('hex');
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

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


  /**
   * Find users in the collection with specific query
   *
   * @param {*} params
   * @returns {array} Array of founded users
   * @memberof UserController
   */
  async findUsers(params) {
    try {
      return await (await this.collection.find(params)).toArray();
    } catch (e) {
      console.error(e);
      throw e;
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
    if (DBClient.isConnected) {
      let username = params.body.username;
      let password = params.body.password;
      let phone = params.body.phone;
      let name = params.body.name;
      let errorCode = 0;

      errorCode = BCValidator.validate(username, [
        [this.customNotEmptyValidator, 1002],
        [BCValidator.isString, 1000],
        [val => val.length > 2, 1003],
        [/^[a-zа-я0-9]+$/i, 1004],
      ]);

      errorCode = errorCode || BCValidator.validate(password, [
        [this.customNotEmptyValidator, 2001],
        [BCValidator.isString, 2000],
        [val => val.length > 5, 2002]
      ]);

      if (errorCode) {
        return BCResponse.buildFromError(errorCode);
      }

      username = username.trim();
      password = this.sha512(password.trim());

      // check if username is taken
      try {
        let foundUsers = await this.findUsers({ username });

        if (foundUsers.length) {
          return BCResponse.buildFromError(1001);
        }
      } catch (e) {
        console.error(e);
        return BCResponse.buildFromError(1, 'Trying to check if username is taken');
      }

      // add new user
      try {
        let ts = Math.round((new Date()).getTime() / 1000);
        let insertionResult = await this.collection.insertOne({
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
          return BCResponse.buildFromError(11);
        }
      } catch (e) {
        console.error(e);
        return BCResponse.buildFromError(1, 'Trying to insert new user data');
      }

      return BCResponse.message('Registered successfuly');
    } else {
      return BCResponse.buildFromError(10);
    }
  }

  /**
   * User login method
   *
   * @param {*} params
   * @returns {*} Response
   * @memberof UserController
   */
  async login (params) {
    if (DBClient.isConnected) {
      let username = params.body.username;
      let password = params.body.password;
      let errorCode = 0;
      let foundUsers = [];

      // check if user exists
      try {
        foundUsers = await this.findUsers({ username });

        if (!foundUsers.length) {
          return BCResponse.buildFromError(1005);
        }
      } catch (e) {
        console.error(e);
        return BCResponse.buildFromError(1, 'Trying to check if user exists');
      }

      errorCode = BCValidator.validate(password, [
        [this.customNotEmptyValidator, 2001],
        [BCValidator.isString, 2000]
      ]);

      if (errorCode) {
        return BCResponse.buildFromError(errorCode);
      }

      password = this.sha512(password.trim());

      if (password === foundUsers[0].password) {
        // generate and attach new token
        let newToken;
        try {
          let ts = Math.round((new Date()).getTime() / 1000);
          newToken = this.sha512(`${Config.get('app.tokensalt')}${ts}`);
          await this.collection.updateOne({ username }, { $push: { tokens: { value: newToken, date: ts } } });
        } catch (e) {
          console.error(e);
          return BCResponse.buildFromError(1, 'Trying to set new token');
        }

        return BCResponse.build({
          token: newToken
        });
      } else {
        return BCResponse.buildFromError(2003);
      }
    } else {
      return BCResponse.buildFromError(10);
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
    if (DBClient.isConnected) {
      if (params.body.token) {
        let foundUser = null;

        // check if session exists
        try {
          foundUser = await this.getUserFromToken(params.body.token);

          if (!foundUser) {
            return BCResponse.buildFromError(3000);
          }
        } catch (e) {
          console.error(e);
          return BCResponse.buildFromError(1, 'Trying to check if session exists');
        }

        await this.collection.updateOne(
          { _id: foundUser._id },
          { $pull: { 'tokens': { value: params.body.token } } }
        );
      }
      return BCResponse.message('Logged out successfuly');
    } else {
      return BCResponse.buildFromError(10);
    }
  }

  /**
   * Get user via token method
   *
   * @param {*} token
   * @returns {User|null} User object or null
   * @memberof UserController
   */
  async getUserFromToken (token) {
    try {
      let foundUsers = await this.findUsers({ tokens: { $elemMatch: { value: token } } });
      return foundUsers.length ? foundUsers[0] : null;
    } catch (e) {
      throw e;
    }
  }
}

namespace('App/Controller/UserController', UserController);
