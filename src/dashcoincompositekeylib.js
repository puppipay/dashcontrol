dashsatoshi = require('dashsatoshi');
dashrambitcore = dashsatoshi;

buffer= require('buffer');
logger = require('./dashlogger');

typeforce = require('typeforce');

var bufferReverse = require('buffer-reverse')
var assert = require('assert');

function getBufControlCodeAddress(code ,uidstr, network) 
{
   assert(dashrambitcore.util.js.isHexaString(uidstr));

   var uidkey = dashrambitcore.util.buffer.hexToBuffer(uidstr); //buffer.Buffer.from(uidstr);
   var codekey = buffer.Buffer.from(code);

   var arr = [codekey, uidkey];
   var compositekey = buffer.Buffer.concat(arr);

   logger.log("getBufControlCodeAddress 1 compositekey="+ compositekey.toString('hex'));

   var uidcompositekey= dashrambitcore.util.buffer.hexToBuffer(compositekey.toString('hex'));

   var pubKeyHash = dashrambitcore.crypto.Hash.sha256ripemd160(uidcompositekey); 

   logger.log("getBufControlCodeAddress 1 pubKeyHash="+ pubKeyHash.toString('hex'));
   var s =  new dashrambitcore.Script();
    s.add(dashrambitcore.Opcode.OP_HASH160)
    s.add(pubKeyHash)
    s.add(dashrambitcore.Opcode.OP_EQUAL)
   var redeemScript = s.toBuffer();
   logger.log("getBufControlCodeAddress redeemScript="+ redeemScript.toString('hex'));

   var sho = dashrambitcore.Script.buildScriptHashOut(s);

   var address = sho.toAddress(network);

   return address;

}


function  get1toManyTransactionForBufCode(code, uidstr,  spendoutlist, paywhom,  network)
{
  try {
  logger.log("get1toManyTransactionForBufCode="+JSON.stringify(paywhom));
  assert(dashrambitcore.util.js.isHexaString(uidstr));

  var uidkey = dashrambitcore.util.buffer.hexToBuffer(uidstr); // Buffer.from(uidstr);
  var codekey = buffer.Buffer.from(code);

  var arr = [codekey, uidkey];
  var compositekey = Buffer.concat(arr);
  



  var pubKeyHash = dashrambitcore.crypto.Hash.sha256ripemd160(compositekey);

  var s =  new dashrambitcore.Script();
   s.add(dashrambitcore.Opcode.OP_HASH160)
   s.add(pubKeyHash)
   s.add(dashrambitcore.Opcode.OP_EQUAL)

   allinput = s.toBuffer();

   var outputs = [
     {
    satoshis: paywhom.partner.amount,
    address: paywhom.partner.address
     },
     {
    satoshis: paywhom.vendor.amount,
    address: paywhom.vendor.address
     },
     {
    satoshis: paywhom.target.amount,
    address: paywhom.target.address
     }

    ];

  var inputs = spendoutlist;

  var tx = dashrambitcore.Transaction( );
        tx.fromComposite(inputs, compositekey, 1);
        tx.to(outputs);
        tx.change(paywhom.vendor.address);
    var v = tx.verify();
    logger.log("v="+v);

  return tx;
  } catch (err) {
    logger.log("get1toManyTransactionForBufCode, err "+ err);
  }

}

module.exports = {
   getBufControlCodeAddress: getBufControlCodeAddress,
   get1toManyTransactionForBufCode: get1toManyTransactionForBufCode,
}
