class BCValidator {
  /**
   * Default simple validator.
   * Checks if value is a string
   *
   * @param {*} val
   * @returns {boolean}
   * @memberof BCValidator
   */
  isString (val) {
    return typeof val === 'string';
  }

  /**
   * Default simple validator.
   * Checks if value is a number
   *
   * @param {*} val
   * @returns {boolean}
   * @memberof BCValidator
   */
  isNumber (val) {
    return typeof val === 'number';
  }

  /**
   * Default simple validator.
   * Checks if value is not empty
   *
   * @param {*} val
   * @returns {boolean}
   * @memberof BCValidator
   */
  notEmpty (val) {
    return !!val
  }

  /**
   * Validate value through a bunch of rules
   *
   * @param {*} val
   * @param {Array} rules
   * @returns {*} single rule callback result
   * @memberof BCValidator
   */
  validate (val, rules) {
    try {
      for (var i = 0; i < rules.length; i++) {
        let result = true;
        if (rules[i][0] && rules[i][0].__proto__.constructor.name === "RegExp") {
          result = val.match(rules[i][0]);
        } else if (typeof rules[i][0] === "function") {
          result = rules[i][0](val);
        }
        if (!result) {
          return (typeof rules[i][1] === "function" ? rules[i][1]() : rules[i][1]);
        }
      }
    } catch (e) {
      console.error('Error while validating the value. ' + e);
      throw e;
    }
  }
}

module.exports = BCValidator;
