const bcrypt = require("bcrypt");

const generateHasedPassword = async (passwordTobeHashed) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(passwordTobeHashed, salt);
    return hashedPassword;
  } catch (error) {
    console.log(`Error - ${error}`);
  }
};

module.exports = generateHasedPassword;
