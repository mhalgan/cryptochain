const cryptoHash = require("./crypto-hash");
const { GENESIS_DATA } = require("./config");

class Block {
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  // Genesis Block factory
  static genesis() {
    return new this(GENESIS_DATA);
  }

  static mineBlock({ lastBlock, data }) {
    const { difficulty } = lastBlock;
    const lastHash = lastBlock.hash;

    let hash, timestamp;
    let nonce = 0;

    do {
      nonce++;
      timestamp = Date.now();
      hash = cryptoHash(timestamp, lastHash, nonce, difficulty, data);
    } while (hash.substring(0, difficulty) !== "0".repeat(difficulty));

    return new this({
      hash,
      timestamp,
      lastHash,
      data,
      nonce,
      difficulty,
    });
  }
}

module.exports = Block;
