require('dotenv').config();

const Web3 = require('web3');
const express = require('express');
const app = express();
const axios = require('axios');
const port = 3000;

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
  )
);

app.get('/', (req, res) =>
  res.send('Hello World! This is a simple API to stalk peoples wallets')
);

app.get('/latest-block', async (req, res) => {
  try {
    const latestBlock = await web3.eth.getBlock('latest');
    const blockNumber = await web3.eth.getBlockNumber();
    res.send({ blockNumber: blockNumber, latestBlock: latestBlock });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving latest block');
  }
});

app.get('/transactions/:address', async (req, res) => {
  try {
    const { data } = await axios.get(
      `http://api.etherscan.io/api?module=account&action=txlist&address=${req.params.address}&startblock=0&endblock=99999999&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`
    );
    const transactions = data.result.map((tx) => {
      return {
        from: tx.from,
        to: tx.to,
        value: Web3.utils.fromWei(tx.value, 'ether') + ' ETH',
      };
    });
    res.send(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving transactions');
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
