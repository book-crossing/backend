module.exports = {
  /**
   * Application port to use.
   */
  "port": env('PORT', 3000),
  "host": env('HOST', 'localhost'),
  "debug": env('DEBUG', true),
  "salt": env('PASSWD_SALT', 'bvkwiubfkw457hwo3ifbvksehb'),
  "tokensalt": env('TOKEN_SALT', 'dfkgndklguhe45igwlbndslfgh'),
};
