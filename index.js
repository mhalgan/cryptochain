const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const Blockchain = require("./blockchain");
const PubSub = require("./app/pubsub");
const Wallet = require("./wallet");
const TransactionPool = require("./wallet/transaction-pool");

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());

app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/api/mine", (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });

  // Broadcasts the chain with the new block to the network
  pubsub.broadcastChain();

  res.redirect("/api/blocks");
});

app.post("/api/transact", (req, res) => {
  const { amount, recipient } = req.body;
  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey,
  });

  try {
    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({ recipient, amount });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);

  res.json({ transaction });
});

app.get("/api/transaction-pool-map", (req, res) => {
  res.json(transactionPool.transactionMap);
});

// Syncs the peer's chain with the root node
const syncWithRootState = () => {
  request(
    { url: `${ROOT_NODE_ADDRESS}/api/blocks` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body);
        blockchain.replaceChain(rootChain);
      }
    }
  );

  request(
    { url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootTransactionPoolMap = JSON.parse(body);
        transactionPool.setMap(rootTransactionPoolMap);
      }
    }
  );
};

let PEER_PORT;

// Generates random ports when running the dev-peer script "npm run dev-peer" to allow multiple instances running locally
if (process.env.GENERATE_PEER_PORT) {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`Listening at localhost:${PORT}`);

  // Root node doesn't need to sync with itself on startup
  if (PORT !== DEFAULT_PORT) {
    syncWithRootState();
  }
});
