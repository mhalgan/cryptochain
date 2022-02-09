const cryptoHash = require("./crypto-hash");
const { GENESIS_DATA } = require("./config");

class Block {
  constructor({ timestamp, lastHash, hash, data }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
  }

  // Genesis Block factory
  static genesis() {
    return new this(GENESIS_DATA);
  }

  static mineBlock({ lastBlock, data }) {
    const timestamp = Date.now();
    const lastHash = lastBlock.hash;
    const hash = cryptoHash(timestamp, lastHash, data);

    return new this({
      hash,
      timestamp,
      lastHash,
      data,
    });
  }
}

module.exports = Block;
