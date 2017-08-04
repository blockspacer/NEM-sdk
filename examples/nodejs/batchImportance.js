let nem = require("../../build/index.js").default;
let http = require("http");

/**
 * Gets the AccountMetaDataPair of an account.
 *
 * @param {array} accounts - Array of account strings
 *
 * @return {array} - An [AccountMetaDataPair]{@link http://bob.nem.ninja/docs/#accountMetaDataPair} object
 */

function arrayToObjArray(arr) {
  let objArr = [];
  for (let i = 0; i < arr.length; i++) {
    objArr.push({ account: arr[i] });
  }
  return objArr;
}

/**
 * Gets the AccountMetaDataPair of an account.
 *
 * @param {array} accounts - Array of account object
 * @param {int} address - An account address
 *
 * @return {object} - An [AccountMetaDataPair]{@link http://bob.nem.ninja/docs/#accountMetaDataPair} object
 */

function batchImportance(accounts, startHeight, endHeight, cb){
  let options = {
    host: "hugealice.nem.ninja",
    port: 7890,
    path: "/account/historical/get/batch",
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  };

  let req = http.request(options, function (res) {
    let responseString = "";

    res.on("data", function (data) {
      responseString += data;
      // save all the data from response
    });
    res.on("end", function () {
      let jsonStr = JSON.parse(responseString);
      // for (let i = 0; i < jsonStr.data.length; i++) {
      //   console.dir(jsonStr.data[i], {colors: true});
      // }
      cb(jsonStr);
      // print to console when response ends
    });
  });

  let params = {
    accounts: accounts,
    startHeight: startHeight,
    endHeight: endHeight,
    incrementBy: 1
  };

  // let params = {
  //   accounts: [
  //     {account: "NDU5U5VNFUO3NMYSGRM52DHVJLTSMK6OMN3434EO"},
  //     {account: "NAGJC2R7BQWK7HDAJ6L263VADAIAF4RNOUBADKR7"}
  //   ],
  //   startHeight: 1220778,
  //   endHeight: 1220778,
  //   incrementBy: 1
  // };


  req.write(JSON.stringify(params));
  req.end();

}

module.exports = {
  arrayToObjArray,
  batchImportance
}
