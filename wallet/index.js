const { STARTING_BALANCE } = require("../config");
const { ec, cryptoHash } = require("../util");
const Transaction = require("./transaction");

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

  createTransaction({ amount, recipient }) {
    if (amount > this.balance) {
      throw new Error("Amount exceeds balance");
    }

    return new Transaction({ senderWallet: this, recipient, amount });
  }
}

module.exports = Wallet;
