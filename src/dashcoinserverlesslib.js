dashcompositekeylib = require('./dashcoincompositekeylib');
dashsatoshi = require('dashsatoshi');
dashrambitcore = dashsatoshi;

logger = require('./dashlogger');
request = require('request');
promise = require('promise');
var assert = require('assert');

// https://github.com/dashevo/dashcore-lib

//types = require('./node_modules/bitcoinjs-lib/src/types');

typeforce = require('typeforce');
var bufferReverse = require('buffer-reverse')

var globalcontractinfo;
var globalnetwork;
var globalurl;
var globaldriverplans;
var globalplans;


var globalbalance = 0
var globalspendabletxs = [];

function dashcoinInit(contractinfo,  network, url, driverplans, plans, level) 
{
   var valid = true;
   logger.init(level);

   globalcontractinfo = contractinfo;
   globalnetwork = network;
   globalurl = url;
   globaldriverplans = driverplans;
   globalplans = plans;


  if(!globalurl || globalurl.length < 10)  valid = false;
   if(!globalnetwork)  valid = false;
   if(!(globalnetwork == 'testnet' || globalnetwork=='livenet'))  valid = false;
   if(!globalplans) valid = false;
   if(!globalcontractinfo) valid = false;

  return valid;
}

function determineDashSendingShareAmount(type, amount, balance, targetaddr, returnaddr, selectedplan)
{
  var fees = Number(globaldriverplans.dashcoinfees);
  var amount = Number(amount);
  var commission;

  if(selectedplan == globalplans.buttoninstaplan) {
      commission =  (0.01) * amount * globaldriverplans.buttoninstaplan; // like 2%
  } else if(selectedplan == globalplans.subscribedplan) {
      commission =  (0.01) * amount * globaldriverplans.subscribedplan; // like 2%
  } else {
      commission =  (0.01) * amount * globaldriverplans.standardplan; // like 4%
  }


   var shares = {
	partner: {
	outscriptPubKey: toDashOutputScript(globalcontractinfo.partneraddress, globalnetwork),
	address: globalcontractinfo.partneraddress,
	amount: Number((commission * 0.5).toFixed(0))
	},
	vendor: {
	outscriptPubKey: toDashOutputScript(globalcontractinfo.vendoraddress, globalnetwork),
	address: globalcontractinfo.vendoraddress,
	amount: Number((commission * 0.5).toFixed(0))
	},
	target: {
	outscriptPubKey: toDashOutputScript(targetaddr, globalnetwork),
	address: targetaddr,
	amount: Number((amount).toFixed(0))
	},
	returnaddr: {
	outscriptPubKey: toDashOutputScript(returnaddr, globalnetwork),
	address: returnaddr,
	amount: Number((balance-amount- commission - fees).toFixed(0))
	}
	
   };
  return shares;
}

function toDashOutputScript(addr, network)
{
	return dashrambitcore.DashScript.buildPublicKeyHashOut(addr, network);
}


function determineDashRedeemingShareAmount(type, balance, targetaddr, selectedplan)
{

  var fees = Number(globaldriverplans.dashcoinfees);
  var balance = Number(balance);
  var commission;

  if(selectedplan == globalplans.buttoninstaplan) {
      commission =  (0.01) * balance * globaldriverplans.buttoninstaplan; // like 2%
  } else if(selectedplan == globalplans.subscribedplan) {
      commission =  (0.01) * balance * globaldriverplans.subscribedplan; // like 2%
  } else {
      commission =  (0.01) * balance * globaldriverplans.standardplan; // like 4%
  }

  var targetaddr1 =targetaddr;
  var targetaddr2 =targetaddr;

   var shares = {
	partner: {
	outscriptPubKey: toDashOutputScript(globalcontractinfo.partneraddress, globalnetwork),
	address: globalcontractinfo.partneraddress,
	amount: Number((commission * 0.5).toFixed(0))
	},
	target: {
	outscriptPubKey: toDashOutputScript(targetaddr1, globalnetwork),
	address: targetaddr2.toString(),
	amount: Number((balance -commission - fees ).toFixed(0))
	},
	vendor: {
	outscriptPubKey: toDashOutputScript(globalcontractinfo.vendoraddress, globalnetwork),
	address: globalcontractinfo.vendoraddress,
	amount: Number((commission * 0.5) .toFixed(0))
	}
	
   };

  logger.log("shares="+JSON.stringify(shares));

  return shares;
}

// var url = 'https://api.blockcypher.com/v1/bcy/test/addrs/';
// var url = 'https://testnet-insight.dashevo.org/insight-api/addr/'; //yWGQRPF8ZYzM2YmX6ZAdHjwWgonEEyKppo

function getDashBalance (param)
{
  var url = globalurl + '/insight-api/addr/'; 
  var promise = new Promise(function (resolve, reject) {

    request.get(url + param  , function (error, response, body) {
        if (error) {
           reject(error);
        }
        logger.log('Body:', body)
        if (typeof body === 'string') {
            try {
            body = JSON.parse(body)
            } catch (err) {
		reject(err);
            }
        logger.log('Body:', body)

	 var txs = body.transactions;
         globalbalance = 0;
         globalbalance = body.balanceSat;
         globalspendabletxs = [];
        resolve(globalbalance);
        }
        else {
	var error = {
	 status: "unknown message"
         };
	reject(error);
        }
    });
  });

  return promise;
}


function dotransactioncheck (param, tx)
{
  var promise = new Promise(function (resolve, reject) {

    request.get(url + param , function (error, response, body) {
        if (error) {
           reject(error);
        }
            body = JSON.parse(body)
        logger.log('Body:', body)

	 var txs = body.txs;
         var status = checkiftransactionexists(txs, tx);

    resolve(status);
    });
  });

  return promise;
}

function checkiftransactionexists(globaltxs, tx)
{
 var exists = false;
   for(var i=0; i< globaltxs.length; i++)
   {
     if(globaltxs[i].hash == tx)
        exists = true;
   }
  return exists;
}

function processtx(address)
{
  var url = globalurl + '/insight-api/addr/'+address+'/utxo';
  var promise = new Promise(function (resolve, reject) {

    request.get(url   , function (error, response, body) {
        if (error) {
           reject(error);
        }
        if (typeof body === 'string') {
          try {
            body = JSON.parse(body)
          } catch (err) {

		reject(err);
          }
        logger.log('Body:', body)
	var n = body.map(function(x) {
    var p = {
  	"txId" : x.txid,
  	"outputIndex" : x.vout,
  	"address" : x.address,
  	"script" : x.scriptPubKey,
  	"satoshis" : x.satoshis
	 };
        return p; 
        });
	resolve(n);
        }
  });
 });
 return promise;

}


function regularDashcoinSendingFund(type, amount, targetaddr, activatingkeypair, choosenplan)
{
var activatepromise = new Promise(function (resolve, reject) {
    var spendingaddr = activatingkeypair.toAddress(globalnetwork).toString() ;
    var returnaddr = spendingaddr;
    logger.log("spendingaddr=",spendingaddr);
    var balpromise = getDashBalance(spendingaddr );

    balpromise.then(function(notused) {

    var hashType = 1 ;
    if(globalbalance == 0)
    {
	logger.log("globalbalance="+globalbalance);
        var error = "Balance is zero";
        reject(error);
    }    

    logger.log("globalbalance="+globalbalance);
    var activationshares = determineDashSendingShareAmount(type, amount, globalbalance, targetaddr, returnaddr, choosenplan)
    var txpromise = processtx(spendingaddr );

    txpromise.then(function(txreceived) {
    var spendoutlist = txreceived;
    var inputs=txreceived;

   var outputs = [
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
        reject(error);
    });
    }).catch (function(error){

	logger.log("regularDashcoinSendingFund : Issue getting balances");
        reject(error);
    });
  });

  return activatepromise;

}

// https://github.com/dashevo/bitcore-dash


function getDashcoinCompositeAddress(senderstub, uidkey, usagetype  )
{
// type 1, hashofdoc is used in raw string
// type 2, hash of hashofdoc is used in  string
  assert(dashrambitcore.util.js.isHexaString(uidkey));
  var Pin = JSON.stringify(senderstub);
//  var Pinkey = Buffer.from(Pin);

   var blockchainaddress = dashcompositekeylib.getBufControlCodeAddress(Pin, 
		uidkey,
		globalnetwork);
   logger.log("blockchainaddress = "+blockchainaddress);

   return blockchainaddress;
}



function compReceiveFund(senderstub, uidkey, targetaddr )
{
// type 1, hashofdoc is used in raw string
// type 2, hash of hashofdoc is used in  string
   
   //return money, to sender after usage
  assert(dashrambitcore.util.js.isHexaString(uidkey));
    var Pin = JSON.stringify(senderstub);
   var Pinkey = Buffer.from(Pin);
 
    var blockchainaddress = dashcompositekeylib.getBufControlCodeAddress(Pinkey,
                 uidkey,
                 globalnetwork);

 var type = 1;

var activatepromise = new Promise(function (resolve, reject) {
     var promise = getDashBalance(blockchainaddress );
 
     promise.then(function(notused) {
 
     var spendoutlist = globalspendabletxs;
 
 
     logger.log("globalbalance="+globalbalance);
     var spendoutlist = globalspendabletxs;
     if(globalbalance == 0) {
	reject("balance is zero");
     }

   var paytowhom = determineDashRedeemingShareAmount(type, globalbalance, targetaddr, selectedplan )

   if(globalbalance > 100) {
   var tx = dashcompositekeylib.getAllTransactionForCustomContract(Pinkey, uidkey, spendoutlist, paytowhom, globalnetwork); 

   resolve(tx);
   }
    else{
     resolve(0);
    }
    }).catch (function(error){

        reject(error);
	logger.log("looks catch ok");
    });
  });

  return activatepromise;

}

function compDashcoinReceive1toManyFund(senderstub, uidkey, targetaddr, selectedplan )
{
   
  assert(dashrambitcore.util.js.isHexaString(uidkey));
  var Pin = JSON.stringify(senderstub);
 
  var blockchainaddress = dashcompositekeylib.getBufControlCodeAddress(Pin,
                 uidkey,
                 globalnetwork);
  logger.log("blockchainaddress  = "+blockchainaddress);

  var activatepromise = new Promise(function (resolve, reject) {

  var type = 1;

  var balpromise = getDashBalance(blockchainaddress );

    balpromise.then(function(notused) {
    var hashType = 1 ;
    if(globalbalance == 0)
    {
        logger.log("globalbalance="+globalbalance);
        var error = "Balance is zero";
        reject(error);

    }

    var txpromise = processtx(blockchainaddress );

    txpromise.then(function(txreceived) {
    var spendoutlist = txreceived;
    var inputs=txreceived;
   
    if(inputs.length == 0)
    {
        reject('no inputs to spend');
    }

   logger.log("targetaddr = "+ targetaddr);
   var paytowhom = determineDashRedeemingShareAmount(type, globalbalance, targetaddr, selectedplan);

   var tx = dashcompositekeylib.get1toManyTransactionForBufCode(Pin, uidkey, spendoutlist, paytowhom, globalnetwork); 
  
   var txobject = tx.toBuffer();

   logger.log("compDashcoinReceive1toManyFund : transaction ready");
    var mydata = {
      txobject: txobject,
      fromaddress: blockchainaddress.toString(),
      balance: globalbalance
    };
     resolve(mydata);
    }).catch (function(error){
        logger.log("compDashcoinReceive1toManyFund : issue getting txs ");
        var myerror = {
          error: error,
          context: "issue getting txs",
        };
        reject(myerror);

    }).catch (function(error){

        logger.log("compDashcoinReceive1toManyFund : issue getting balance ");
        reject(error);
  });

 });
});

  return activatepromise;
}




function sendtx(tx)
{
   var pushtx = {
    rawtx: tx
   };

   var config = {
    params: pushtx
   };

//   var lurl = 'https://api.blockcypher.com/v1/bcy/test/txs/push';
//   var lurl = 'https://testnet-insight.dashevo.org/insight-api/tx/send';

var lurl = globalurl + '/insight-api/tx/send';
   var promise = new Promise(function (resolve, reject) {
   logger.log("before push=", JSON.stringify(pushtx));

   
   request.post(lurl, {json:true, body:pushtx} , function (error, response, body) {
        if (error) {
           reject(error);
        }
        resolve(body);
     });

    });

   return promise;
}




module.exports = {
   dashcoinInit: dashcoinInit,
   regularDashcoinSendingFund: regularDashcoinSendingFund,
   getDashcoinCompositeAddress: getDashcoinCompositeAddress,
   compDashcoinReceive1toManyFund: compDashcoinReceive1toManyFund,
   sendtx: sendtx
}
