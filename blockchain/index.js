const Block = require("./block");
const { cryptoHash } = require("../util");

class Blockchain {
  constructor() {
    const genesisBlock = Block.genesis();
    this.chain = [genesisBlock];
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({ lastBlock: this.chain.at(-1), data });
    this.chain.push(newBlock);
  }

  replaceChain(chain) {
    if (chain.length <= this.chain.length) {
      console.error("The incoming chain must be longer");
      return;
    }

    if (!Blockchain.isValidChain(chain)) {
      console.error("The incoming chain must be valid");
      return;
    }

    console.log("Replacing chain with", chain);
    this.chain = chain;
  }

  static isValidChain(chain) {
    // Should start with the Genesis block
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }

    // Skip Genesis block
    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, data, nonce, difficulty } = chain[i];
      const actualLastHash = chain[i - 1].hash;
      const lastDifficulty = chain[i - 1].difficulty;

      // Prevents difficulty jump attacks
      if (Math.abs(lastDifficulty - difficulty) > 1) return false;

      // The `lastHash` property should match the previous block `hash`
      if (lastHash !== actualLastHash) return false;

      const validatedHash = cryptoHash(
        timestamp,
        lastHash,
        data,
        nonce,
        difficulty
      );
      // The Block `hash` should be valid
      if (hash !== validatedHash) return false;
    }
    return true;
  }
}

module.exports = Blockchain;
