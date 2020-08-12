const Arweave = require("arweave");
const fs = require("fs");

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false, // Enable network request logging
});

const privateKey = require("./privateKey.json");

async function init(privateKey) {
  const address = await arweave.wallets.jwkToAddress(privateKey);
  const winston = await arweave.wallets.getBalance(address);
  const ar = arweave.ar.winstonToAr(winston);
  console.log(winston, ar);
  return { address, privateKey };
}

async function sendtx(account) {
  const tx = await arweave.createTransaction(
    {
      data: '<html><head><meta charset="UTF-8"><title>Hello world!</title></head><body></body></html>',
    },
    account.privateKey
  );
  tx.addTag("Content-Type", "text/html");
  await arweave.transactions.sign(tx, account.privateKey);
  let uploader = await arweave.transactions.getUploader(tx);

  while (!uploader.isComplete) {
    await uploader.uploadChunk();
    console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
  }
  return tx.id;
}

async function getTx(txId) {
  return arweave.transactions.getData(txId, { decode: true, string: true });
}

// init(privateKey).then(sendtx).then(getTx).then(console.log).catch(console.error);
init(privateKey);
