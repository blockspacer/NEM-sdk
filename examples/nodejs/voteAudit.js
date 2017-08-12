let nem = require("../../build/index.js").default;
let json2csv = require('json2csv');
const fs = require('fs');
let batchImp = require("./batchImportance.js");

// Create an NIS endpoint object
let endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultMainnet, nem.model.nodes.defaultPort);

// Poll option addresses
let address = "NAEGC6G4IMTUYR7IRE26UTAVBRPL2HQG2VPMEJVN";
// let address = "NB2GIT5SVEYTGZUX33Y6RT26IHAI5SENEJJAZHYK";

const exchanges = [
  'NBZMQO-7ZPBYN-BDUR7F-75MAKA-2S3DHD-CIFG77-5N3D', //Poloniex
  'ND2JRP-QIWXHK-AA26IN-VGA7SR-EEUMX5-QAI6VU-7HNR', //Bittrex
  'NCP7UH-5BT5OH-PAWPFF-VNR245-3BNODJ-UZJ677-7N3N', //HitBTC
  'NCXDAH-KIRVCM-S2HEXB-HYDSUW-XABAYG-VNLB3H-ZFWJ', //HitBTC
  'NCCFO5-QDFV5F-S3BTBP-EU2QO6-UHZD7P-HGFNCP-ISDL', //Bitcoin Indonesia
  'ND7HQ7-3YTGNE-YJT6PP-VOR6GM-2RHTVJ-TNRG2N-W5B6', //Btc38
  'NDKTFW-VFDHDU-L4L3GX-Q32RVO-HQ5IJ5-DEAYHO-J7YS', //BTER
  'NC2MYW-XT3YOS-AIBTWB-CW7ZKC-E4R4NI-KYCF7S-76UC', //BTER
  'NCQJR647FLD7UM6FFVL4Z7DYLWJ3I6OGV5TMALUO', //Changelly
  'NBLQ6P-E7Z5CV-ANJNXG-OR74UQ-LOJ2YM-GJJOZ4-YFAQ', //Changelly
];

let voteArray = [];
let voterAddressArray = [];
let msCount = 0;
let duplicateArray = [];
let txId = 0;
let lastHash = null;
let exchangeVote = [];
let importanceAccumulator = 0;
let balanceAccumulator = 0;

//Block #1220816 (timeStamp: 73928852) is the last block
//before poll close (timeStamp: 73929215)
let importanceAtHeight = 1220816;

getTxAll(lastHash);

function getTxAll(lastHash) {
  nem.com.requests.account.transactions.incoming(endpoint, address, lastHash, null).then(function(res) {
    for (let i = 0; i < res.data.length; i++) {
      let vote = {};
      vote.index = txId;
      vote.timeStamp = res.data[i].transaction.timeStamp;
      vote.txHash = res.data[i].meta.hash.data;
      txId++;

      if (res.data[i].transaction.type === 4100) {
        vote.voterAddress = nem.utils.format.pubToAddress(res.data[i].transaction.otherTrans.signer, nem.model.network.data.mainnet.id);
      } else {
        vote.voterAddress = nem.utils.format.pubToAddress(res.data[i].transaction.signer, nem.model.network.data.mainnet.id);
      }

      if(voterAddressArray.indexOf(vote.voterAddress) === -1){
        checkExchangeAddress(vote);
        voterAddressArray.push(vote.voterAddress);
        voteArray.push(vote);
      }
      else {
        duplicateArray.push(vote);
        txId--;
      }
    }

    //finish querying all transactions from option address
    if (res.data.length < 25) {
      console.log(`Total votes to ${address}: ${txId}`);
      return getImportance(voterAddressArray);
    }
    else {
      lastHash = voteArray[voteArray.length-1].txHash;
      getTxAll(lastHash);
    }

    }, function(err) {
      console.error(err);
    });

}

function getImportance(arr) {
  let arrObj = batchImp.arrayToObjArray(arr);
  batchImp.batchImportance(arrObj, importanceAtHeight, importanceAtHeight, function(res){
    for (let i = 0; i < res.data.length; i++) {
      importanceAccumulator += res.data[i].data[0].importance;
      voteArray[i].importance = res.data[i].data[0].importance;
      balanceAccumulator += res.data[i].data[0].balance;
      voteArray[i].balance = res.data[i].data[0].balance;
    }
      displayResult();
      exportResult();
  });

}

function checkExchangeAddress(vote) {
  for (let i = 0; i < exchanges.length; i++) {
    if (vote.voterAddress == nem.model.address.clean(exchanges[i])) {
      exchangeVote.push(vote);
    }
  }
}

function exportResult() {
  fs.writeFile("votes.json", JSON.stringify(voteArray), (err) => {
    if (err) throw err;
  });

  let fields = ["index", "timeStamp", "voterAddress", "txHash", "importance", "balance"];
  let csv = json2csv({ data: voteArray, fields: fields });
  fs.writeFile('votes.csv', csv, function(err) {
    if (err) throw err;
    console.log(`Output has been saved`);
  });

  if(duplicateArray.length) {
    fields = ["index", "timeStamp", "voterAddress", "txHash"];
    csv = json2csv({ data: duplicateArray, fields: fields });
    fs.writeFile('duplicates.csv', csv, function(err) {
      if (err) throw err;
      console.log(`Output has been saved`);
    });
  }

}

function displayResult() {
  console.log(`\nSum of voters' importance and balance at blockHeight: ${importanceAtHeight} ...`)
  console.log(`Total importance: ${importanceAccumulator}`);
  console.log(`Total balance: ${balanceAccumulator/1000} XEM\n`);

  if (exchangeVote.length) {
    console.log("Accounts from XEM exchanges have voted in this poll: ");
    console.dir(exchangeVote, {colors: true});
  }
  else {
    console.log("No XEM exchange accounts have voted for this option");
  }

  if(duplicateArray.length) {
    console.log("\nDuplicates found and deleted from result: ");
    console.dir(duplicateArray, {colors: true});
  }
}
