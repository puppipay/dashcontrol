bitcore = require('dashsatoshi');
buffer = require('buffer');

dashservice = require('./DashService')



var stub = {"id":"tSGujGftu42w4uajWvNV","date":"1555262126819","pin":"PIN_KR46N8IMF"};

var myuid = "0269c2d7eb71d94701a498aa441320a930faae7d26ec8b52f13d43253a641f6039";
var uid = bitcore.util.buffer.hexToBuffer(myuid) ; 



var network = bitcore.Networks.testnet;
var url = "https://testnet-insight.dashevo.org";


/* 

var gdata = dashservice.dashcoinInit(null,  network, url, null, null, true);

var address = dashservice.getDashcoinCompositeAddress(stub, uid.toString('hex'), network );

*/

var address = '8oc3sRgtHY6RjmLjDne8ok6WJXqJkb2vx3';

console.log("address ="+address);

var generaladdress = 'yhKs3e22N3bb1g9M7YHC2C2ovMJiGfbAJ7';
var vendorfeesfixed= 2549070;
var partnerfeesfixed= 0 ;
var networkfees= 10000;
var vendorfeespercentage= 1.1;
var partnerfeespercentage=0;
var receiveaddress = 'yhKs3e22N3bb1g9M7YHC2C2ovMJiGfbAJ7';


    var workdata = {
      vendoraddress: generaladdress,
      partneraddress: generaladdress,                                   
      returnaddress: generaladdress,                                   
      targetaddress: address,
      vendorfeesfixed: vendorfeesfixed,
      partnerfeesfixed: partnerfeesfixed,
      vendorfeespercentage: vendorfeespercentage,
      partnerfeespercentage: partnerfeespercentage,
      sendingaddress: address, //product.productjson.sendingaddress,
      network: network

    };
    

    // check transaction and prepare to redeem
    dashservice.split2PartyReceive1toMany(stub, uid.toString('hex'), receiveaddress, workdata , networkfees).then(result => {


     console.log ("result="+ JSON.stringify(result));
     var transactiondata = {
       amount: result.amount,
       fromaddress: result.fromaddress,
       toaddress: receiveaddress,    
       txid: result.tx.txid,
       network: network,
       };


    var dataforupdate= {
      txid: transactiondata.txid,
      amountreceived: result.amount,
      transactionfees: networkfees
      };

     }).catch(err =>  {
       console.log ("error "+ err);
     });


  
/*
Example output
 result={"tx":{"txid":"20d75e7a8bd509b943f25e78d8b4c75af12b0f60c34d18ce5618dc207f32e7c0"},"shares":{"partner":{"outscriptPubKey":{"chunks":[{"opcodenum":118},{"opcodenum":169},{"buf":{"type":"Buffer","data":[230,110,215,26,18,179,252,25,63,78,71,91,240,122,176,193,80,111,16,153]},"len":20,"opcodenum":20},{"opcodenum":136},{"opcodenum":172}],"_network":{"name":"testnet","alias":"regtest","pubkeyhash":140,"privatekey":239,"scripthash":19,"xpubkey":70617039,"xprivkey":70615956,"port":19999,"networkMagic":{"type":"Buffer","data":[206,226,202,255]},"dnsSeeds":["testnet-seed.darkcoin.io","testnet-seed.dashdot.io","test.dnsseed.masternode.io"]}},"address":"yhKs3e22N3bb1g9M7YHC2C2ovMJiGfbAJ7","amount":2549070},"vendor":{"outscriptPubKey":{"chunks":[{"opcodenum":118},{"opcodenum":169},{"buf":{"type":"Buffer","data":[230,110,215,26,18,179,252,25,63,78,71,91,240,122,176,193,80,111,16,153]},"len":20,"opcodenum":20},{"opcodenum":136},{"opcodenum":172}],"_network":{"name":"testnet","alias":"regtest","pubkeyhash":140,"privatekey":239,"scripthash":19,"xpubkey":70617039,"xprivkey":70615956,"port":19999,"networkMagic":{"type":"Buffer","data":[206,226,202,255]},"dnsSeeds":["testnet-seed.darkcoin.io","testnet-seed.dashdot.io","test.dnsseed.masternode.io"]}},"address":"yhKs3e22N3bb1g9M7YHC2C2ovMJiGfbAJ7","amount":7625458},"target":{"outscriptPubKey":{"chunks":[{"opcodenum":118},{"opcodenum":169},{"buf":{"type":"Buffer","data":[100,185,206,229,156,40,104,213,3,229,47,224,46,59,120,147,226,252,31,32]},"len":20,"opcodenum":20},{"opcodenum":136},{"opcodenum":172}],"_network":{"name":"testnet","alias":"regtest","pubkeyhash":140,"privatekey":239,"scripthash":19,"xpubkey":70617039,"xprivkey":70615956,"port":19999,"networkMagic":{"type":"Buffer","data":[206,226,202,255]},"dnsSeeds":["testnet-seed.darkcoin.io","testnet-seed.dashdot.io","test.dnsseed.masternode.io"]}},"address":"8oc3sRgtHY6RjmLjDne8ok6WJXqJkb2vx3","amount":451305328}},"fromaddress":"8oc3sRgtHY6RjmLjDne8ok6WJXqJkb2vx3","amount":461489856}


*/

