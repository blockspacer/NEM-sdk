let nem = require("../../build/index.js").default;

console.log(nem.utils.format.pubToAddress(process.argv[2], nem.model.network.data.mainnet.id));
