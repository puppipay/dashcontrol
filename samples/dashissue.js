bitcore = require('dashsatoshi');
buffer = require('buffer');

dashservice = require('./DashService')



var st = {"id":"tSGujGftu42w4uajWvNV","date":"1555262126819","pin":"PIN_KR46N8IMF"};

var myuid = "0269c2d7eb71d94701a498aa441320a930faae7d26ec8b52f13d43253a641f6039";
var uid = bitcore.util.buffer.hexToBuffer(myuid) ; 



var network = bitcore.Networks.testnet;
var url = "https://testnet-insight.dashevo.org";


var gdata = dashservice.dashcoinInit(null,  network, url, null, null, true);

var address = dashservice.getDashcoinCompositeAddress(st, uid.toString('hex'), network );


console.log("address ="+address);
