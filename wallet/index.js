const { STARTING_BALANCE } = require("../config");
const { ec, cryptoHash } = require("../util");

class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;

    // Generates unique pair of public and private keys
    this.keyPair = ec.genKeyPair();

    // Also serves as the wallet address
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }

  sign(data) {
    // Generates a signature based on some data and the wallet instance key pair
    return this.keyPair.sign(cryptoHash(data));
  }
}

module.exports = Wallet;
