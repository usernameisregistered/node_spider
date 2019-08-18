const fs = require("fs");

let agentList = JSON.parse(fs.readFileSync(__dirname + "/generalUserAgent.json"))

exports.getOneAgent = function(){
    return agentList[Math.floor(Math.random() * agentList.length )];
}