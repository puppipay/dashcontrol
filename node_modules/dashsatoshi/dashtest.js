bitcore = require('ramdashlibpe3');
buffer = require('buffer');


var somedata = {"id":"tSGujGftu42w4uajWvNV","date":"1555262126819","pin":"PIN_KR46N8IMF"};

var randomuid = "0269c2d7eb71d94701a498aa441320a930faae7d26ec8b52f13d43253a641f6039";
var uid = bitcore.util.buffer.hexToBuffer(randomuid) ; 



var uidkey = buffer.Buffer.from(uid.toString('hex'));
var codekey = buffer.Buffer.from(JSON.stringify(somedata));

var arr = [codekey, uidkey];
var compositekey = buffer.Buffer.concat(arr);

var comp = compositekey.toString('hex');

console.log("compositekey="+ comp);

var uid= bitcore.util.buffer.hexToBuffer(comp);

var pubKeyHash = bitcore.crypto.Hash.sha256ripemd160(uid); 

console.log("pubKeyHash="+ pubKeyHash.toString('hex'));



