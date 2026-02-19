const validators = {
  positiveInteger: (value) => {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
  },

  nonNegativeInteger: (value) => {
    const num = Number(value);
    return Number.isInteger(num) && num >= 0;
  },

  email: (email) => {
    const regex = /^[A-Za-z0-9._%+-]+@utdallas\.edu$/;
    return regex.test(email);
  },

  password: (password) => {
    return typeof password === "string" && password.length >= 8;
  },

  nonEmptyString: (str) => {
    return typeof str === "string" && str.trim().length > 0;
  },

  maxLength: (str, max) => {
    return typeof str === "string" && str.length <= max;
  },

  probability: (value) => {
    const num = Number(value);
    return typeof num === "number" && num >= 0 && num <= 1;
  },
};

module.exports = validators;
