const hexToBinary = require("hex-to-binary");
const cryptoHash = require("./crypto-hash");
const { GENESIS_DATA, MINE_RATE } = require("./config");

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

  // Returns a block after the "proof of work" is completed
  static mineBlock({ lastBlock, data }) {
    const lastHash = lastBlock.hash;
    let { difficulty } = lastBlock;
    let hash, timestamp;
    let nonce = 0;

    // Generates new hashes by incrementing the nonce until the
    // first (difficulty) characters of the hash are 0s
    // Ex: difficulty 3 -> hash 000100110110... is valid
    // Also dinamically adjusts the difficulty based on the time needed
    // to mine the block and the MINE_RATE
    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({
        originalBlock: lastBlock,
        timestamp,
      });
      hash = cryptoHash(timestamp, lastHash, nonce, difficulty, data);

      // Uses the binary 256 bits version of hash to allow the difficulty adjustment to be more granular
      // Ex: valid difficulty 3 in hex 0003fe21... in binary 000100101011...
      // The binary option allows finer adjustment
    } while (
      hexToBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty)
    );

    return new this({
      hash,
      timestamp,
      lastHash,
      data,
      nonce,
      difficulty,
    });
  }

  // Dinamically adjusts the difficulty to mine the next block
  // based on the time needed to mine the last one and the MINE_RATE
  static adjustDifficulty({ originalBlock, timestamp }) {
    const { difficulty } = originalBlock;

    // difficulty can never be a negative number
    if (difficulty < 1) return 1;

    if (timestamp - originalBlock.timestamp > MINE_RATE) {
      return difficulty - 1;
    }
    return difficulty + 1;
  }
}

module.exports = Block;
