const crypto = require("crypto");

const cryptoHash = (...inputs) => {
  const hash = crypto.createHash("sha256");

  // Sorts the inputs array to make sure the order does not matter when creating the hash
  hash.update(inputs.sort().join(" "));
  return hash.digest("hex");
};

module.exports = cryptoHash;
