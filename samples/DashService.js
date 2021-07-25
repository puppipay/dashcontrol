dashbitcore = require('dashsatoshi');

dashcoincontrol = require('../index.js');

serverwith = dashcoincontrol.serverlib;

bufferReverse = require('buffer-reverse')



module.exports = {

  dashtest: function (plans) {
    return plans;
  },

  dashcoinInit: function (contractinfo,  network, url, driverplans, plans, dashlogger) {


    var gdata = serverwith.dashcoinInit(contractinfo,  network, url, driverplans, plans, dashlogger);

    return gdata;
  },
  
  getDashcoinCompositeAddress: function (creatorstub, uidkey,  network ) {


    var address = serverwith.getDashcoinCompositeAddress(creatorstub, uidkey,  network );

    return address;
  },

  regularDashcoinSendingFund : function (serverlesstype, amount, address, activatingkeypair, plan, gdata) {

      var txpromise = serverwith.regularDashcoinSendingFund(serverlesstype, amount, address, activatingkeypair, plan, gdata); 

      txpromise.then(function(tx) {
      serverwith.sendtx(tx.toString('hex'), gdata).then(function(tx1) {
         console.log("sending transaction ="+ (tx1));
         return null;
      }).catch (function(error){
         console.log("error="+error);
         return error;
      });
      }).catch (function(error){
         console.log(error);
         return error;
      });;


  },

  regular2PartySplitSend: function (amount, address, activatingkeypair, workdata, network) {

     var txpromise = serverwith.regular2PartySplitSend(amount, address, activatingkeypair, workdata, network); 

     txpromise.then(function(tx) {
        serverwith.sendtx(tx.toString('hex'), gdata).then(function(tx1) {
        return null;

     }).catch (function(error){
        console.log(error);
        return error;
    });
    }).catch (function(error){
        console.log(error);
        return error;
   });;


  },

  getDashKeyPinAddress : function (kycid, network) {

   var retset = serverwith.getDashKeyPinAddress(kycid, network);
   return retset;

  },

  getCustomUidDashKeyPinAddress : function (kycid, myuid, network) {

   var retset = serverwith.getCustomUidDashKeyPinAddress(kycid, myuid, network);
   return retset;
  },

  getCustomPinDashAddress : function (kycid, mypin, network) {

   var retset = serverwith.getCustomPinDashAddress(kycid, mypin, network);
   return retset;

  },

  getDashKeyJsonPinAddress : function (kycid, mypin, network) {

   var retset = serverwith.getDashKeyJsonPinAddress(kycid, mypin, network);
   return retset;
  },

  compDashcoinReceive1toManyFund: function (creatorstub, uidkey, receiveaddress, receiveplan, gdata ){
  
   return new Promise((resolve, reject) => {

   var txpromise = serverwith.compDashcoinReceive1toManyFund(creatorstub, uidkey, receiveaddress, receiveplan, gdata );
   txpromise.then(function(obj) {
      var tx = obj.txobject;
      var retrieveamount = obj.balance;
      var fromaddress = obj.fromaddress;

       if(tx != null) {
         serverwith.sendtx(tx.toString('hex'), gdata).then(function(tx1) {

         if(!isHexa(tx1.txid)) {
            reject (JSON.stringify(tx1));
         }

         var txparse = tx1; 
         var mydata = {
          tx: tx1,
          fromaddress: fromaddress,
          amount: retrieveamount
         };
         resolve(mydata);

     }, (err) => {
         var myerror = {
          error: err,
          context: "Transaction failed during broadcast",
        };

        reject(myerror);
     });

   } else {
        var myerror = {
          error: "no transactions available to spend",
          context: "issue getting txs",
        };
        reject(myerror);
   }
  
  }).catch(function (err) {
         var myerror = {
          error: err,
          context: "compDashcoinReceive1toManyFund processing"
        };
        reject(myerror);

  });

  });
     

  },

  split2PartyReceive1toMany: function (creatorstub, uidkey, receiveaddress, workdata, networkfees ){
  
   return new Promise((resolve, reject) => {

   var txpromise = serverwith.split2PartyReceive1toMany(creatorstub, uidkey, receiveaddress, workdata, networkfees );

   txpromise.then(function(obj) {
      var tx = obj.txobject;
      var retrieveamount = obj.balance;
      var fromaddress = obj.fromaddress;
      var shares = obj.shares;

       if(tx != null) {
         serverwith.sendtx(tx.toString('hex'), workdata.network).then(function(tx1) {

         if(!isHexa(tx1.txid)) {

            reject (JSON.stringify(tx1));

         }
         var txparse = tx1; // JSON.parse(tx1 );
         var mydata = {
          tx: tx1,
          shares: shares,
          fromaddress: fromaddress,
          amount: retrieveamount
         };
         resolve(mydata);

     }, (err) => {
         var myerror = {
          error: err,
          context: "Transaction failed during broadcast",
        };

        reject(myerror);
     });

   } else {
         var myerror = {
          error: "no transactions available to spend",
          context: "issue getting txs",
        };
        reject(myerror);
   }
  
  }).catch(function (err) {
         var myerror = {
          error: err,
          context: "split2PartyReceive1toMany processing"
        };
        reject(myerror);

  });

  });
     

  },


}


 function isHexa (value) {
    if (typeof value === 'string' ) {
      return /^[0-9a-fA-F]+$/.test(value);
    } else {
     return false;
    }
  }

