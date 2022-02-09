const Block = require("./block");
const cryptoHash = require("./crypto-hash");

class Blockchain {
  constructor() {
    const genesisBlock = Block.genesis();
    this.chain = [genesisBlock];
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({ lastBlock: this.chain.at(-1), data });
    this.chain.push(newBlock);
  }

  static isValidChain(chain) {
    // Should start with the Genesis block
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }

    // Skip Genesis block
    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, data } = chain[i];
      const actualLastHash = chain[i - 1].hash;

      // The `lastHash` property should match the previous block `hash`
      if (lastHash !== actualLastHash) return false;

      const validatedHash = cryptoHash(timestamp, lastHash, data);
      // The Block `hash` should be valid
      if (hash !== validatedHash) return false;
    }
    return true;
  }
}

module.exports = Blockchain;