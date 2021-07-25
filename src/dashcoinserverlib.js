dashcompositekeylib = require('./dashcoincompositekeylib');
dashsatoshi = require('dashsatoshi');
dashrambitcore = dashsatoshi;

logger = require('./dashlogger');
request = require('request');
promise = require('promise');
var assert = require('assert');
var _ = require('lodash');



typeforce = require('typeforce');
var bufferReverse = require('buffer-reverse')


   logger.init(true);

function dashcoinInit(contractinfo,  network, url, driverplans, plans, level) 
{
  var valid = true;
   logger.init(level);


   var gdata = {
   globalcontractinfo : contractinfo,
   globalnetwork : network,
   globalurl : url,
   globaldriverplans : driverplans,
   globalplans : plans,

   };

  return gdata;
}

function determineDashSendingShareAmount(type, amount, balance, targetaddr, returnaddr, selectedplan, gdata)
{

  try {
  var fees = Number(gdata.globaldriverplans.dashcoinfees);
  var amount = Number(amount);
  var commission;

  if(selectedplan == gdata.globalplans.buttoninstaplan) {
      commission =  (0.01) * amount * gdata.globaldriverplans.buttoninstaplan; // like 2%
  } else if(selectedplan == gdata.globalplans.subscribedplan) {
      commission =  (0.01) * amount * gdata.globaldriverplans.subscribedplan; // like 2%
  } else {
      commission =  (0.01) * amount * gdata.globaldriverplans.standardplan; // like 4%
  }
   logger.log("partneraddress= "+ gdata.globalcontractinfo.partneraddress);
   logger.log("global network="+  gdata.globalnetwork);


   var shares = {
	partner: {
	outscriptPubKey: toDashOutputScript(gdata.globalcontractinfo.partneraddress, gdata.globalnetwork),
	address: gdata.globalcontractinfo.partneraddress,
	amount: Number((commission * 0.5).toFixed(0))
	},
	vendor: {
	outscriptPubKey: toDashOutputScript(gdata.globalcontractinfo.vendoraddress, gdata.globalnetwork),
	address: gdata.globalcontractinfo.vendoraddress,
	amount: Number((commission * 0.5).toFixed(0))
	},
	target: {
	outscriptPubKey: toDashOutputScript(targetaddr, gdata.globalnetwork),
	address: targetaddr,
	amount: Number((amount).toFixed(0))
	},
	returnaddr: {
	outscriptPubKey: toDashOutputScript(returnaddr, gdata.globalnetwork),
	address: returnaddr,
	amount: Number((balance-amount- commission - fees).toFixed(0))
	}
	
   };

  if(shares.partner.amount < 0 ||
     shares.target.amount < 0 ||
     shares.returnaddr.amount < 0 ||
     shares.vendor.amount < 0 
   ) {
     return -1;
   } else {
     return shares;
    }
  } catch (err) {
   logger.log("determineDashSendingShareAmount "+  err);
     return -2;
  }
}


function sending2partySplit(amountsent, balanceinaddress, workdata, networkfees)
{

   logger.log("sending2partySplit entered= "+ JSON.stringify(workdata) );
  try {
  var fees = Number(networkfees);
  var amount = Number(amountsent);
  var balance = Number(balanceinaddress);

  var  vendorcommission =  (0.01) * amount * Number(workdata.vendorfeespercentage) + Number(workdata.vendorfeesfixed) ; 

  var  partnercommission =  (0.01) * amount * Number(workdata.partnerfeespercentage) + Number(workdata.vendorfeesfixed) ; 



   var shares = {
	partner: {
	outscriptPubKey: toDashOutputScript(workdata.partneraddress, workdata.network),
	address: workdata.partneraddress,
	amount: Number((partnercommission ).toFixed(0))
	},
	vendor: {
	outscriptPubKey: toDashOutputScript(workdata.vendoraddress, gdataworkdata.network ),
	address: workdata.vendoraddress,
	amount: Number((vendorcommission ).toFixed(0))
	},
	target: {
	outscriptPubKey: toDashOutputScript(workdata.targetaddress, workdata.network),
	address: workdata.targetaddress,
	amount: Number((amount).toFixed(0))
	},
	returnaddr: {
	outscriptPubKey: toDashOutputScript(workdata.returnaddress, workdata.network),
	address: workdata.returnaddress,
	amount: Number((balance-amount- vendorcommission -partnercommission - fees).toFixed(0))
	}
	
   };
   logger.log("sending2partySplit shares= "+ JSON.stringify(shares) );

  if(shares.partner.amount < 0 ||
     shares.target.amount < 0 ||
     shares.returnaddr.amount < 0 ||
     shares.vendor.amount < 0 
   ) {
     return -1;
   } else {
     return shares;
    }
  } catch (err) {
   logger.log("sending2partySplit err "+  err);
     return -2;
  }
}


function toDashOutputScript(addr, network)
{
	return dashrambitcore.DashScript.buildPublicKeyHashOut(addr, network);
}


function determineDashRedeemingShareAmount(type, balance, targetaddr, selectedplan, gdata)
{
   

   logger.log("determineDashRedeemingShareAmount entered "+ JSON.stringify(gdata));
  try {
  var fees = Number(gdata.globaldriverplans.dashcoinfees);
  var balance = Number(balance);
  var commission;

  if(selectedplan == gdata.globalplans.buttoninstaplan) {
      commission =  (0.01) * balance * gdata.globaldriverplans.buttoninstaplan; // like 2%
  } else if(selectedplan == gdata.globalplans.subscribedplan) {
      commission =  (0.01) * balance * gdata.globaldriverplans.subscribedplan; // like 2%
  } else {
      commission =  (0.01) * balance * gdata.globaldriverplans.standardplan; // like 4%
  }

  var targetaddr1 =targetaddr;
  var targetaddr2 =targetaddr;
  logger.log("targetaddrx="+targetaddr);
  logger.log("targetaddr="+JSON.stringify(targetaddr.toString()));
  logger.log("balance="+balance);
  logger.log("commission="+commission);
  logger.log("fees="+fees);
  logger.log("globalcontrctinfo="+JSON.stringify(gdata.globalcontractinfo));

   var shares = {
	partner: {
	outscriptPubKey: toDashOutputScript(gdata.globalcontractinfo.partneraddress, gdata.globalnetwork),
	address: gdata.globalcontractinfo.partneraddress,
	amount: Number((commission * 0.5).toFixed(0))
	},
	target: {
	outscriptPubKey: toDashOutputScript(targetaddr1, gdata.globalnetwork),
	address: targetaddr2.toString(),
	amount: Number((balance -commission - fees ).toFixed(0))
	},
	vendor: {
	outscriptPubKey: toDashOutputScript(gdata.globalcontractinfo.vendoraddress, gdata.globalnetwork),
	address: gdata.globalcontractinfo.vendoraddress,
	amount: Number((commission * 0.5) .toFixed(0))
	}
	
   };

  logger.log("shares="+JSON.stringify(shares));
  if(shares.partner.amount < 0 ||
     shares.target.amount < 0 ||
     shares.vendor.amount < 0 
   ) {
     return -1;
   } else {
     return shares;
    }

  } catch (err) {

  logger.log("determineDashRedeemingShareAmount err="+ err);
     return -2;
  }
}

function receiving2PartySplit(balancesent, workdata , networkfees)
{
   

   logger.log("receiving2PartySplit entered "+ JSON.stringify(workdata));
  try {
  var fees = Number(networkfees);
  var balance = Number(balancesent);
  var commission;

  var  vendorcommission =  (0.01) * balance * Number(workdata.vendorfeespercentage) + Number(workdata.vendorfeesfixed) ; 

  var  partnercommission =  (0.01) * balance * Number(workdata.partnerfeespercentage) + Number(workdata.vendorfeesfixed) ; 

  logger.log("balancesent  ="+balance);
  logger.log("vendorcommision  ="+vendorcommission);
  logger.log("partnercommision  ="+partnercommission);
  logger.log("fees  ="+fees);

  if( balance < ( vendorcommission +partnercommission + fees) ) {
     return -3;
  }

   var shares = {
	partner: {
	outscriptPubKey: toDashOutputScript(workdata.partneraddress, workdata.network),
	address: workdata.partneraddress,
	amount: Number((partnercommission ).toFixed(0))
	},
	vendor: {
	outscriptPubKey: toDashOutputScript(workdata.vendoraddress, workdata.network ),
	address: workdata.vendoraddress,
	amount: Number((vendorcommission).toFixed(0) )
	},
	target: {
	outscriptPubKey: toDashOutputScript(workdata.targetaddress, workdata.network),
	address: workdata.targetaddress,
	amount: Number(Number(balance- vendorcommission -partnercommission - fees).toFixed(0))
	},
	
   };

  logger.log("receiving2PartySplit shares="+JSON.stringify(shares));

  if(shares.partner.amount < 0 ||
     shares.target.amount < 0 ||
     shares.vendor.amount < 0 
   ) {
     return -1;
   } else {
     return shares;
    }

  } catch (err) {

  logger.log("receiving2PartySplit err="+ err);
     return -2;
  }
}

//var url = 'https://api.blockcypher.com/v1/bcy/test/addrs/';
// var url = 'https://testnet-insight.dashevo.org/insight-api/addr/'; //yWGQRPF8ZYzM2YmX6ZAdHjwWgonEEyKppo

function getDashBalance (param, network)
{
 console.log("Checking Dash balance");
var url ;
 if(network == "testnet") {
url = 'https://testnet-insight.dashevo.org/insight-api/addr/'; //yWGQRPF8ZYzM2YmX6ZAdHjwWgonEEyKppo
 } else {
url = 'https://insight.dashevo.org/insight-api/addr/'; //yWGQRPF8ZYzM2YmX6ZAdHjwWgonEEyKppo

 }
// var url = globalurl + '/insight-api/addr/'; //yWGQRPF8ZYzM2YmX6ZAdHjwWgonEEyKppo
var promise = new Promise(function (resolve, reject) {

    request.get(url + param  , function (error, response, body) {
        if (error) {
           console.log("getDashBalance: "+error);
             var myerror = {
               error: error,
               context: "getDashBalance: failed to get balance",
             };

           reject(myerror);
        }

           console.log("Body: "+body);
//           console.log("response: "+JSON.stringify(response));

        logger.log('Body:'+ body)
            try {
            body = JSON.parse(body)
              if(body.length == 0) {
               var myerror = {
                 error: 0,
                 context: "getDashBalance: no data received",
               };
		reject(myerror);

              }
            } catch (err) {
             var myerror = {
               error: err,
               context: "getDashBalance: failed JSON parse",
             };
		reject(myerror);
            }
        logger.log('Body:'+ body)
       
        if(body) {

	 var txs = body.transactions;
         globalbalance = 0;
         globalbalance = body.balanceSat;
         globalspendabletxs = [];
//         globalspendabletxs = processtx(txs, param);


    resolve(globalbalance);
         } else {
             var myerror = {
               error: "undefined body",
               context: "getDashBalance: undefined body ",
             };
	reject(myerror);
         }

        });
	// return callback(null, body)
  });

  return promise;
}


function processtx(address, network)
{

 console.log("Doing processtx "+ address);
var globalurl1 ;
var url1 ;
 if(network == 'testnet') {
globalurl1 = "https://testnet-insight.dashevo.org"; 
url1 = globalurl1 + "/insight-api/addr/"+address+"/utxo";
 } else {
globalurl1 = "https://insight.dashevo.org"; 
url1 = globalurl1 + "/insight-api/addr/"+address+"/utxo";

 }

   logger.log('Processtx calling url:'+ url1)
var promise = new Promise(function (resolve, reject) {
    
   logger.log('Processtx calling url:'+ url1)
    request.get(url1   , function (error, response, body1) {
        if (error) {
           logger.log('Processtx error :'+ error)
             var myerror = {
               error: error,
               context: "processtx: failed to get utxo",
             };
           reject(myerror);
        }
        logger.log('Body:'+ body1)
        var body;

          try {
            body = JSON.parse(body1)
            if(body.length == 0) {
               var myerror = {
                 error: 0,
                 context: "processtx: no data received",
               };
                reject(myerror);

              }

          } catch (err) {

                logger.log('Body parse failed'+ err)
             var myerror = {
               error: err,
               context: "processtx: Json body parse failed",
             };
		reject(myerror);
          }
        logger.log('before body.map');
	var n = body.map(function(x) {
        logger.log('x');
    var p = {
"txId" : x.txid,
  "outputIndex" : x.vout,
  "address" : x.address,
  "script" : x.scriptPubKey,
  "satoshis" : x.satoshis
	 };
    return p; 
        });


        logger.log('resolve n');
	resolve(n);
  });
});

return promise;

}


function regularDashcoinSendingFund(type, amount, targetaddr, activatingkeypair, choosenplan, gdata)
{
 	// buildatransaction, broadcast.


var activatepromise = new Promise(function (resolve, reject) {
    var spendingaddr = activatingkeypair.toAddress(gdata.globalnetwork).toString() ;
    var returnaddr = spendingaddr;
    logger.log("spendingaddr="+spendingaddr);
    var balpromise = getDashBalance(spendingaddr, network );

    balpromise.then(function(globalbalance) {

    // var txb = new bitcoin.TransactionBuilder (globalnetwork);

    var hashType = 1 ;
    if(globalbalance == 0)
    {
	logger.log("globalbalance="+globalbalance);
        var error = "Balance is zero";
             var myerror = {
               error: "Dash balance is zero",
               context: "regularDashcoinSendingFund: Dash balance is zero",
             };
        reject(myerror);

    }    

    logger.log("globalbalance="+globalbalance);
    var activationshares = determineDashSendingShareAmount(type, amount, globalbalance, targetaddr, returnaddr, choosenplan, gdata)

    if(activationshares == -1) {
             var myerror = {
               error: "No sufficient funds to process",
               context: "regularDashcoinSendingFund: No sufficient funds",
             };
        reject(myerror);
    }

    if(activationshares == -2) {
             var myerror = {
               error: "Error in processing determineDashSendingShareAmount",
               context: "regularDashcoinSendingFund: Internal error ",
             };
        reject(myerror);
    }

    var txpromise = processtx(spendingaddr, gdata.globalnetwork );

    txpromise.then(function(txreceived) {
    var spendoutlist = txreceived;
    var inputs=txreceived;
    logger.log("before oupputs="+JSON.stringify(activationshares));

 var   outputs = [
     { 
    satoshis: activationshares.partner.amount,
    address: activationshares.partner.address
     },
     { 
    satoshis: activationshares.vendor.amount,
    address: activationshares.vendor.address
     },
     { 
    satoshis: activationshares.target.amount,
    address: activationshares.target.address
     },
     { 
    satoshis: activationshares.returnaddr.amount,
    address: activationshares.returnaddr.address
     }

    ];
 
   logger.log(JSON.stringify(outputs));


   var tx = dashrambitcore.Transaction( )
	.from(inputs)
	.to(outputs)
        .change(activationshares.returnaddr.address)
	.sign(activatingkeypair );
   var txobject = tx.toBuffer();

   logger.log("regularDashcoinSendingFund: txobject ");
   resolve(txobject);
    }).catch (function(error){

	logger.log("regularDashcoinSendingFund : Issue getting txs");
             var myerror = {
               error: "error",
               context: "regularDashcoinSendingFund: Issue getting txs",
             };
        reject(myerror);
    });
    }).catch (function(error){

	logger.log("regularDashcoinSendingFund : Issue getting balances");
             var myerror = {
               error: "error",
               context: "regularDashcoinSendingFund: Issue getting balances",
             };
        reject(myerror);
    });
  });

  return activatepromise;

}

function regular2PartySplitSend(amount, targetaddr, activatingkeypair, workdata, network)
{


var activatepromise = new Promise(function (resolve, reject) {
    var spendingaddr = activatingkeypair.toAddress(network).toString() ;
    var returnaddr = spendingaddr;

    if(spendingaddr != workdata.spendingaddr) {
    var myerror = {
               error: "error",
               context: "regular2PartySplitSend: spendingaddr not matching wif",
             };
        reject(myerror);
    }

    logger.log("regular2PartySplitSend: spendingaddr="+spendingaddr);
    var balpromise = getDashBalance(spendingaddr, network );

    balpromise.then(function(globalbalance) {


    var hashType = 1 ;
    if(globalbalance == 0)
    {
	logger.log("regular2PartySplitSend: globalbalance="+globalbalance);
        var error = "Balance is zero";
             var myerror = {
               error: "Dash balance is zero",
               context: "regularDashcoinSendingFund: Dash balance is zero",
             };
        reject(myerror);

    }    

    logger.log("regular2PartySplitSend: globalbalance="+globalbalance);
    var activationshares = sending2partySplit(amount, balance, workdata, networkfees);

    if(activationshares == -1) {
             var myerror = {
               error: "No sufficient funds to process",
               context: "regularDashcoinSendingFund: No sufficient funds",
             };
        reject(myerror);
    }

    if(activationshares == -2) {
             var myerror = {
               error: "Error in processing determineDashSendingShareAmount",
               context: "regularDashcoinSendingFund: Internal error ",
             };
        reject(myerror);
    }

    var txpromise = processtx(spendingaddr , gdata.globalnetwork );

    txpromise.then(function(txreceived) {
    var spendoutlist = txreceived;
    var inputs=txreceived;
    logger.log("regular2PartySplitSend: before outputs="+JSON.stringify(activationshares));

 var   outputs = [
     { 
    satoshis: activationshares.partner.amount,
    address: activationshares.partner.address
     },
     { 
    satoshis: activationshares.vendor.amount,
    address: activationshares.vendor.address
     },
     { 
    satoshis: activationshares.target.amount,
    address: activationshares.target.address
     },
     { 
    satoshis: activationshares.returnaddr.amount,
    address: activationshares.returnaddr.address
     }

    ];
 
   logger.log(JSON.stringify(outputs));


   var tx = dashrambitcore.Transaction( )
	.from(inputs)
	.to(outputs)
        .change(activationshares.returnaddr.address)
	.sign(activatingkeypair );
   var txobject = tx.toBuffer();

   logger.log("regular2PartySplitSend:  txobject ");
   resolve(txobject);
    }).catch (function(error){

	logger.log("regular2PartySplitSend : Issue getting txs");
             var myerror = {
               error: "error",
               context: "regular2PartySplitSend: Issue getting txs",
             };
        reject(myerror);
    });
    }).catch (function(error){

	logger.log("regular2PartySplitSend : Issue getting balances");
             var myerror = {
               error: "error",
               context: "regular2PartySplitSend: Issue getting balances",
             };
        reject(myerror);
    });
  });

  return activatepromise;

}


function getDashKeyPinAddress(kycid, network) {
  
  var length = 9;
  var pindata = {
   id: kycid,
   date: Date.now().toString(),
   pin: "PIN_"+Math.random().toString(36).substr(2, length).toUpperCase()
  };

   var keyPair = new dashrambitcore.PrivateKey() ; // dash.dashcoin.ECPair.makeRandom();
  var pubkey =  new dashrambitcore.PublicKey(keyPair); // keyPair.getPublicKeyBuffer();
  var uidkey =  pubkey.toBuffer()// keyPair.getPublicKeyBuffer();

  var docaddr = getDashcoinCompositeAddress(pindata,
                uidkey.toString('hex'),
                network);

  var set = {
      address: docaddr.toString(),
      uid: uidkey.toString('hex'),
      pindata: pindata
   };

  return set;
}



function getCustomUidDashKeyPinAddress(kycid,uidkey, network) {

   assert(dashrambitcore.util.js.isHexaString(uidkey));

  var length = 9;
  var pindata = {
   id: kycid,
   date: Date.now().toString(),
   pin: "PIN_"+Math.random().toString(36).substr(2, length).toUpperCase()
  };


  var docaddr = getDashcoinCompositeAddress(pindata,
                uidkey,
                network);

  var set = {
      address: docaddr.toString(),
      uid: uidkey,
      pindata: pindata
   };

  return set;
}


function getDashKeyJsonPinAddress(kycid,jsonpin, network) {

   assert(dashrambitcore.util.js.isValidJSON(jsonpin));

  var stringedjson ;
  if(!_.isString(jsonpin)) {
    stringedjson  = JSON.stringify(jsonpin);
  } else {

    stringedjson  = jsonpin;
  }

  var pindata = {
   id: kycid,
   date: Date.now().toString(),
   pin: "PIN_"+stringedjson
  };


   var keyPair = new dashrambitcore.PrivateKey() ; // dash.dashcoin.ECPair.makeRandom();
  var pubkey =  new dashrambitcore.PublicKey(keyPair); // keyPair.getPublicKeyBuffer();
  var uidkey =  pubkey.toBuffer()// keyPair.getPublicKeyBuffer();

  var docaddr = getDashcoinCompositeAddress(pindata,
                uidkey.toString('hex'),
                network);

  var set = {
      address: docaddr.toString(),
      uid: uidkey.toString('hex'),
      pindata: pindata
   };

  return set;
}

function getCustomPinDashAddress(kycid,sentpin, network) {

   assert(!_.isString(sentpin));

  var pindata = {
   id: kycid,
   date: Date.now().toString(),
   pin: "PIN_"+sentpin
  };


   var keyPair = new dashrambitcore.PrivateKey() ; // dash.dashcoin.ECPair.makeRandom();
  var pubkey =  new dashrambitcore.PublicKey(keyPair); // keyPair.getPublicKeyBuffer();
  var uidkey =  pubkey.toBuffer()// keyPair.getPublicKeyBuffer();

  var docaddr = getDashcoinCompositeAddress(pindata,
                uidkey.toString('hex'),
                network);

  var set = {
      address: docaddr.toString(),
      uid: uidkey.toString('hex'),
      pindata: pindata
   };

  return set;
}


function getDashcoinCompositeAddress(senderstub, uidkey, network  )
{
// type 1, hashofdoc is used in raw string
// type 2, hash of hashofdoc is used in  string
   assert(dashrambitcore.util.js.isHexaString(uidkey));

  var Pin = JSON.stringify(senderstub);
//  var Pinkey = Buffer.from(Pin);

   var docaddr = dashcompositekeylib.getBufControlCodeAddress(Pin, 
		uidkey,
		network);
   logger.log("docaddr = "+docaddr);

   return docaddr;

}

function getSplit2PartyAddress(senderstub, uidkey, network  )
{
   assert(dashrambitcore.util.js.isHexaString(uidkey));

  var Pin = JSON.stringify(senderstub);

   var docaddr = dashcompositekeylib.getBufControlCodeAddress(Pin,
                uidkey,
                network);
   logger.log("docaddr = "+docaddr);

   return docaddr;

}


function compDashcoinReceive1toManyFund(senderstub, uidkey, targetaddr, selectedplan , gdata)
{
   
     assert(dashrambitcore.util.js.isHexaString(uidkey));

    var Pin = JSON.stringify(senderstub);
 
    var docaddr = dashcompositekeylib.getBufControlCodeAddress(Pin,
                 uidkey,
                 gdata.globalnetwork);
   logger.log("docaddr 2 = "+docaddr);




var activatepromise = new Promise(function (resolve, reject) {

 var type = 1;
     var balpromise = getDashBalance(docaddr, network );

    balpromise.then(function(globalbalance) {


    var hashType = 1 ;
    if(globalbalance == 0)
    {
        logger.log("globalbalance="+globalbalance);
        var error = "Balance is zero";
             var myerror = {
               error: "Dash balance is zero",
               context: "compDashcoinReceive1toManyFund: Dash balance is zero",
             };
        reject(myerror);

    }


    var txpromise = processtx(docaddr, gdata.globalnetwork );

    txpromise.then(function(txreceived) {
    var spendoutlist = txreceived;
    var inputs=txreceived;
   
    if(inputs.length == 0)
    {
             var myerror = {
               error: "Dash balance is zero",
               context: "compDashcoinReceive1toManyFund: no inputs to spend",
             };
        reject(myerror);

    }
   logger.log("targetaddr = "+ targetaddr);
   var paytowhom = determineDashRedeemingShareAmount(type, globalbalance, targetaddr, selectedplan, gdata);

    if(paytowhom == -1) {
             var myerror = {
               error: "No sufficient funds to process",
               context: "compDashcoinReceive1toManyFund: No sufficient funds",
             };
        reject(myerror);
    }

    if(paytowhom == -2) {
             var myerror = {
               error: "Error processing determineDashRedeemingShareAmount",
               context: "compDashcoinReceive1toManyFund: Internal error",
             };
        reject(myerror);
    }

   logger.log("calling get1toManyTransactionForBufCode  ");
   var tx = dashcompositekeylib.get1toManyTransactionForBufCode(Pin, uidkey, spendoutlist, paytowhom, gdata.globalnetwork); 
  


     var txobject = tx.toBuffer();

    logger.log("compDashcoinReceive1toManyFund : transaction ready");
    var mydata = {
      txobject: txobject,
      fromaddress: docaddr.toString(),
      balance: globalbalance
    };
     resolve(mydata);
    }).catch (function(error){
        logger.log("compDashcoinReceive1toManyFund : issue getting txs ");
         var myerror = {
               error: "error",
               context: "compDashcoinReceive1toManyFund: Issue getting txs",
             };

        reject(myerror);

    }).catch (function(error){

        logger.log("compDashcoinReceive1toManyFund : issue getting balance ");
         var myerror = {
               error: "error",
               context: "compDashcoinReceive1toManyFund: Issue getting balance",
             };
        reject(myerror);
  });

});
});

  return activatepromise;
}

function split2PartyReceive1toMany(senderstub, uidkey, targetaddr,  workdata,  networkfees)
{
     assert(dashrambitcore.util.js.isHexaString(uidkey));

   logger.log("split2PartyReceive1toMany networkfees  = "+networkfees);

    var network = workdata.network;

    var Pin = JSON.stringify(senderstub);
 
    var docaddr = dashcompositekeylib.getBufControlCodeAddress(Pin,
                 uidkey,
                 network);
   logger.log("split2PartyReceive1toMany Addr  = "+docaddr);




var activatepromise = new Promise(function (resolve, reject) {

 var type = 1;
     var balpromise = getDashBalance(docaddr ,network );

    balpromise.then(function(globalbalance) {


    var hashType = 1 ;
    if(globalbalance == 0)
    {
        logger.log("globalbalance="+globalbalance);
        var error = "Balance is zero";
             var myerror = {
               error: "Dash balance is zero",
               context: "split2PartyReceive1toMany: Dash balance is zero",
             };
        reject(myerror);

    }


    var txpromise = processtx(docaddr, network );

    txpromise.then(function(txreceived) {
    var spendoutlist = txreceived;
    var inputs=txreceived;
   
    if(inputs.length == 0)
    {
             var myerror = {
               error: "Dash balance is zero",
               context: "split2PartyReceive1toMany: no inputs to spend",
             };
        reject(myerror);

    }
   logger.log("split2PartyReceive1toMany targetaddr = "+ targetaddr);
   var paytowhom = receiving2PartySplit(globalbalance, workdata , networkfees)


    if(paytowhom == -1) {
             var myerror = {
               error: "No sufficient funds to process",
               context: "split2PartyReceive1toMany: No sufficient funds",
             };
        reject(myerror);
    }

    if(paytowhom == -2) {
             var myerror = {
               error: "Error processing receiving2PartySplit",
               context: "split2PartyReceive1toMany: Internal error",
             };
        reject(myerror);
    }

     if(paytowhom == -3) {
             var myerror = {
               error: "Error processing receiving2PartySplit",
               context: "split2PartyReceive1toMany: Less than minimum funds",
             };
        reject(myerror);
    }



   logger.log("split2PartyReceive1toMany: calling get1toManyTransactionForBufCode  ");
   var tx = dashcompositekeylib.get1toManyTransactionForBufCode(Pin, uidkey, spendoutlist, paytowhom, network); 
  


     var txobject = tx.toBuffer();

    logger.log("split2PartyReceive1toMany : transaction ready");
    var mydata = {
      txobject: txobject,
      fromaddress: docaddr.toString(),
        shares:  paytowhom,
      balance: globalbalance
    };
     resolve(mydata);
    }).catch (function(error){
        logger.log("split2PartyReceive1toMany : issue getting txs ");
         var myerror = {
               error: "error",
               context: "split2PartyReceive1toMany: Issue getting txs",
             };

        reject(myerror);

    }).catch (function(error){

        logger.log("split2PartyReceive1toMany : issue getting balance ");
         var myerror = {
               error: "error",
               context: "split2PartyReceive1toMany: Issue getting balance",
             };
        reject(myerror);
  });

});
});

  return activatepromise;
}

function doc2Validate(addr, usagetype,receiverstub, tx, uidkey )
{
}


function sendtx(tx, network)
{
   var pushtx = {
    rawtx: tx
   };

var config = {
 params: pushtx
};

 var lurl ;
 if(network == 'testnet') {
 lurl = 'https://testnet-insight.dashevo.org/insight-api/tx/send';
 } else {
 //lurl = 'https://api.blockcypher.com/v1/bcy/test/txs/push';
 lurl = 'https://insight.dashevo.org/insight-api/tx/send';

 }

   var promise = new Promise(function (resolve, reject) {
   logger.log("before push=", JSON.stringify(pushtx));

   
   request.post(lurl, {json:true, body:pushtx} , function (error, response, body) {
        if (error) {
         var myerror = {
               error: "error",
               context: "txsend: Issue sending tx",
             };
           reject(myerror);
        }
        resolve(body);
     });

    });

   return promise;
}




module.exports = {
   dashcoinInit: dashcoinInit,
   regularDashcoinSendingFund: regularDashcoinSendingFund,
   regular2PartySplitSend: regular2PartySplitSend,
   getSplit2PartyAddress: getSplit2PartyAddress,  // not used, can be deleted
   getDashcoinCompositeAddress: getDashcoinCompositeAddress,
   getDashKeyPinAddress: getDashKeyPinAddress,
   getCustomPinDashAddress: getCustomPinDashAddress,
   getDashKeyJsonPinAddress: getDashKeyJsonPinAddress,
   getCustomUidDashKeyPinAddress: getCustomUidDashKeyPinAddress,
//   doc1Checktx: doc1Checktx,
//   doc1CheckAddr: doc1CheckAddr,
//   compReceiveFund: compReceiveFund,
   compDashcoinReceive1toManyFund: compDashcoinReceive1toManyFund,
   receiving2PartySplit: receiving2PartySplit,
   split2PartyReceive1toMany: split2PartyReceive1toMany,
//   doc2Uploadv: doc2Uploadv,
   sendtx: sendtx
//   doc2Validate: doc2Validate
}
