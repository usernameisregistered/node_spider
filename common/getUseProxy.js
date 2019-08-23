// 获取可以使用的代理ip
const process = require("process");
if (process.argv.length < 4) {
    console.log("缺少必要的参数")
    process.exit()
}
const fs = require("fs")
const checkProxy = require("../common/checkProxy").checkProxy
const connection = require("../common/connectSQL").connection;
var moment = require('moment')

let index = 0;
let proxyList = [];
let type = process.argv[2].toLowerCase();
let cryptonym = process.argv[3] * 1;
let sql = `select id,ip,port,protocol,unusefulaccount,usefulaccount from proxy_info_distinct where protocol='${type.toUpperCase()}' and cryptonym=${cryptonym}`;
connection.query(sql, function (error, results, fields) {
    if (error) throw error; 
    for (let item of results) {
        proxyList.push(item)
    }
    checkOneProxy()
});

function checkOneProxy(){
    if(index < proxyList.length){
        checkProxy(proxyList[index]).then((data) => {
            console.log(`第${index}/${proxyList.length}条proxy信息： ${data.protocol.toLowerCase()}://${data.ip}:${data.port}可用`)
            data.useful = 1
            data.usefulaccount = data.usefulaccount * 1 + 1
            data.checktime = Date.now()
            wirteSql(data)
            index++
            checkOneProxy()
        }).catch((data) => {
            console.log(`第${index}/${proxyList.length}条proxy信息： ${data.protocol.toLowerCase()}://${data.ip}:${data.port}不可用`)
            data.useful = 0
            data.unusefulaccount = data.unusefulaccount * 1 + 1
            data.checktime = Date.now()
            wirteSql(data)
            index++
            checkOneProxy()
        })
    }else{
        fs.writeFileSync('usefulProxy.json',JSON.stringify(proxyList.filter(item=>item.useful!=0),null,4));
        connection.end();
        process.exit()
    }  
}

function wirteSql(item){
    let sql = `update proxy_info_distinct set usefulaccount=${item.usefulaccount * 1},unusefulaccount=${item.unusefulaccount * 1},checktime='${moment(item.checktime).format("YYYY-MM-DD HH:ss:mm")}' where id=${item.id};`
    connection.query(sql, function (error, results, fields) {
        if (error) throw error; 
        console.log("数据修改成功")
    });
}

