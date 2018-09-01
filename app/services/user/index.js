const $Events = use('EventService');
const $DB = use('DBService');

class UserService {
  constructor() {
    $Events.on('db.connect', () => {
      this.collection = $DB.collection('users');
    })
  }

  /**
   * Find users in the collection with specific query.
   *
   * @param {*} params
   * @returns {array} Array of founded users
   * @memberof UserService
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
   * Find user in the collection with specific query.
   *
   * @param {*} params
   * @returns {User|null} Found user or null
   * @memberof UserService
   */
  async findUser(params) {
    try {
      return await this.collection.findOne(params) || null;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * Get user via token method.
   *
   * @param {*} token
   * @returns {User|null} User object or null
   * @memberof UserService
   */
  async getUserFromToken(token) {
    try {
      let foundUsers = await this.findUsers({ tokens: { $elemMatch: { value: token } } });
      return foundUsers.length ? foundUsers[0] : null;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * Remove token from user.
   *
   * @param {string} token Auth token
   * @returns {boolean}
   * @memberof UserService
   */
  async removeToken(token) {
    let foundUser = null;

    // check if session exists
    try {
      foundUser = await this.getUserFromToken(token);

      if (!foundUser) {
        return false;
      }

      await this.collection.updateOne(
        { _id: foundUser._id },
        { $pull: { 'tokens': { value: token } } }
      );

      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

module.exports = UserService;
