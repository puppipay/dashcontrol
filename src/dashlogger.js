var globaldashlog = false;
function init(level) 
{
  globaldashlog = level;
}

function log(message) 
{
  if(globaldashlog) {
  console.log("Dash " + message);
  }
}




module.exports = {
   log: log,
   init: init,
}
