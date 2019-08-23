// 获取可以使用的代理ip
const fs = require("fs")
const checkProxy = require("../common/checkProxy").checkProxy
const process = require("process");
const connection = require("../common/connectSQL").connection;
if (process.argv.length < 4) {
    console.log("缺少必要的参数")
    process.exit()
}
let index = 0;
let proxyList = [];
let type = process.argv[2].toLowerCase();
let cryptonym = process.argv[3] * 1;
let sql = `select id,ip,port,protocol,unusefulaccount,usefulaccount from proxy_info_distinct where protocol='${type.toUpperCase()}' and cryptonym=${cryptonym}`;
console.log(sql)
connection.query(sql, function (error, results, fields) {
    if (error) throw error; 
    //connection.end();
    for (let item of results) {
        proxyList.push(item)
    }
    checkOneProxy()
});

function checkOneProxy(){
    if(index < proxyList.length){
        checkProxy(proxyList[index]).then((data) => {
            console.log(`第${index}/${proxyList.length}条proxy信息： ${proxyList[index].protocol.toLowerCase()}://${proxyList[index].ip}:${proxyList[index].port}可用`)
            proxyList[index].useful = 1
            proxyList[index].usefulaccount = proxyList[index].usefulaccount * 1 + 1
            proxyList[index].checktime = Date.now()
            index++
            checkOneProxy()
        }).catch(err => {
            console.log(`第${index}/${proxyList.length}条proxy信息： ${proxyList[index].protocol.toLowerCase()}://${proxyList[index].ip}:${proxyList[index].port}可用`)
            proxyList[index].useful = 0
            proxyList[index].unusefulaccount = proxyList[index].unusefulaccount * 1 + 1
            proxyList[index].checktime = Date.now()
            index++
            checkOneProxy()
        })
    }else{
        fs.writeFileSync('usefulProxy.json',JSON.stringify(proxyList,null,4))
    }
    
}

