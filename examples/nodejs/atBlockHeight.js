let nem = require("../../build/index.js").default;
let http = require("http");

let options = {
  host: "hugealice.nem.ninja",
  port: 7890,
  path: "/block/at/public",
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
    console.dir(jsonStr.timeStamp, {colors:true});
  });
});

let params = {
  height: Number(process.argv[2]),
};

req.write(JSON.stringify(params));
req.end();
