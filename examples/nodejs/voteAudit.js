var nem = require("../../build/index.js").default;

// Create an NIS endpoint object
var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.mainnet[0].uri, nem.model.nodes.defaultPort);

// Address we'll use in some queries
var address = "NAEGC6G4IMTUYR7IRE26UTAVBRPL2HQG2VPMEJVN";

const exchanges = [
  'NBZMQO-7ZPBYN-BDUR7F-75MAKA-2S3DHD-CIFG77-5N3D', //Poloniex
  'ND2JRP-QIWXHK-AA26IN-VGA7SR-EEUMX5-QAI6VU-7HNR', //Bittrex
  'NCP7UH-5BT5OH-PAWPFF-VNR245-3BNODJ-UZJ677-7N3N', //HitBTC
  'NCXDAH-KIRVCM-S2HEXB-HYDSUW-XABAYG-VNLB3H-ZFWJ', //HitBTC
  'NCCFO5-QDFV5F-S3BTBP-EU2QO6-UHZD7P-HGFNCP-ISDL', //Bitcoin Indonesia
  'ND7HQ7-3YTGNE-YJT6PP-VOR6GM-2RHTVJ-TNRG2N-W5B6', //Btc38
  'NDKTFW-VFDHDU-L4L3GX-Q32RVO-HQ5IJ5-DEAYHO-J7YS', //BTER
  'NC2MYW-XT3YOS-AIBTWB-CW7ZKC-E4R4NI-KYCF7S-76UC', //BTER
]

let voteArray = [];
let txId = 0;
let lastHash = null;
let exchangeVote = [];

getTxAll(lastHash);

function getTxAll(lastHash) {
  nem.com.requests.account.transactions.all(endpoint, address, lastHash, null).then(function(res) {
    let result = res.data;

    for (let i = 0; i < result.length; i++) {
      txId++;
      let vote = {};
      vote.index = txId;
      vote.timeStamp = res.data[i].transaction.timeStamp;
      vote.signerAddr = nem.utils.format.pubToAddress(res.data[i].transaction.signer, nem.model.network.data.mainnet.id);
      vote.txHash = res.data[i].meta.hash.data;
      voteArray.push(vote);
      checkExchangeAddress(vote);
    }

    if (result.length < 25) {
      console.dir(exchangeVote, {colors: true});
      return;
    }
    else {
      lastHash = voteArray[voteArray.length-1].txHash;
      getTxAll(lastHash);
    }

  }, function(err) {
    console.error(err);
  });

}

function checkExchangeAddress(vote) {
  for (let i = 0; i < exchanges.length; i++) {
    if (vote.signerAddr == nem.model.address.clean(exchanges[i])) {
      exchangeVote.push(vote);
    }
  }
}
