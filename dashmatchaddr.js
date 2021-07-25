bitcore = require('dashsatoshi');
buffer = require('buffer');

serverless = require('./src/dashcoinserverlib')



var creatorstub = {
 doc_id: 'doc12',
 doc_type: 'pdf',
 doc_hash: '262772827acb72727'
}

/* {"crc":"a1f0da","uid":"0269c2d7eb71d94701a498aa441320a930faae7d26ec8b52f13d43253a641f6039","pindata":{"id":"tSGujGftu42w4uajWvNV","date":"1555262126819","pin":""}}
*/

var st = {"id":"tSGujGftu42w4uajWvNV","date":"1555262126819","pin":"PIN_KR46N8IMF"};

var myuid = "0269c2d7eb71d94701a498aa441320a930faae7d26ec8b52f13d43253a641f6039";
var uid=    bitcore.util.buffer.hexToBuffer(myuid) ; //new Buffer(myuid, 'hex');



// deterministic RNG for testing only
function rng () { return Buffer.from('1zzttyyzzzzzzzzzzzzzzzzzzzzzzzzz') }

//var network = bitcoin.networks.testnet;
var network = bitcore.Networks.testnet;
var url = "https://testnet-insight.dashevo.org";

/*
//var network = bitcore.Networks.livenet;
//var url = "https://insight.dashevo.org";

var activatingkeypair ; //= bitcoin.ECPair.makeRandom({ network: network, rng: rng })

//console.log(activatingkeypair.toWIF());

var hex2 = Buffer.from('1zzttyyzzzzzzzzzzzzzzzzzzzzzzzzz') ; //'8080808080808080808080808080808080808080808080808080808080808080';

var a = new bitcore.PrivateKey(hex2, network);

var privateKey = a //new bitcore.PrivateKey();
activatingkeypair = a;

var exported = privateKey.toWIF();
// e.g. L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m
var imported = bitcore.PrivateKey.fromWIF(exported);
var hexa = privateKey.toString();
var addr = privateKey.toAddress();
console.log("addr ="+ addr.toString());

var hex3 = Buffer.from('1zzttyyyyzzzzzzzzzzzzzzzzzzzzzzz') ; //'8080808080808080808080808080808080808080808080808080808080808080';
var b = new bitcore.PrivateKey(hex3, network);


var anotheraddr = b.toAddress();

console.log("anotheraddr ="+ anotheraddr.toString());

var uidkey = Buffer.from('a56677b666c88777a1');
*/
var serverlesstype = 1; // doc in composite-key 
//serverless.dashcoinInit(contractinfo, partnerinfo, network, url);

//var address = serverless.getDashcoinCompositeAddress(creatorstub, uidkey, serverlesstype );

//console.log("address ="+address);



var gdata = serverless.dashcoinInit(null,  network, url, null, null, true);

var address = serverless.getDashcoinCompositeAddress(st, uid.toString('hex'), gdata );


console.log("address ="+address);
