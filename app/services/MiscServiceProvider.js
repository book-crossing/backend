const crypto = require('crypto');

class MiscService {
  /**
   * SHA512 hash generator
   *
   * @param {string} val
   * @returns {string} Hash
   * @memberof UserController
   */
  sha512(val, salt) {
    try {
      let hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
      hash.update(val);
      return hash.digest('hex');
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

singleton('MiscService', () => new MiscService());
