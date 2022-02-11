// Script to check the difficulty auto adjustment
const Blockchain = require("./blockchain.js");

const blockchain = new Blockchain();
blockchain.addBlock({ data: "initial" });

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;
const times = [];

for (let i = 0; i < 10000; i++) {
  prevTimestamp = blockchain.chain.at(-1).timestamp;

  blockchain.addBlock({ data: `block ${i}` });
  nextBlock = blockchain.chain.at(-1);

  nextTimestamp = nextBlock.timestamp;
  timeDiff = nextTimestamp - prevTimestamp;
  times.push(timeDiff);

  average = Math.round(
    times.reduce((total, time) => total + time) / times.length
  );

  console.log(
    `Time to mine block ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}. Average time: ${average}ms`
  );
}
