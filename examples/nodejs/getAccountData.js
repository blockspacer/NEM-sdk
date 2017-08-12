var nem = require("../../build/index.js").default;

// Create an NIS endpoint object
var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultMainnet, nem.model.nodes.defaultPort);

// Address we'll use in some queries
var address = "NDNRP26S2GKWMZAQ2OQXE24JDX7TBY6MUFRL5BFP";

// Get account data
nem.com.requests.account.data(endpoint, address).then(function(res) {
  console.dir(res, {colors:true});
}, function(err) {
	console.error(err);
});

//NDXVHGK5C2GB326SI4ZEITSMCLUNQB6ZRLQTB6OG
//NDNRP26S2GKWMZAQ2OQXE24JDX7TBY6MUFRL5BFP
//NCF7RIACTLSQCHWWL2LHFMYQFBKMD6BRY7KPMMTN
//NDJPXFVJMD2GSMTIPXBBE5ZDHJVRLWYY4RXLQRVL
