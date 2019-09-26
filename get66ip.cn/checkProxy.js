const http = require('http');
const https = require('https')
const HttpProxyAgent = require('http-proxy-agent');
const connection = require("../common/connectSQL").connection;
const process = require("process")
const args = process.argv
const moment = require('moment')
let search ={};
let sql;
if(args[2]){
    if(/^\d{4}-\d{2}-\d{2}$/.test(args[2])){
        search.startTime =Date.parse(new Date(args[2] + " 00:00:00"));
    }else{
        console.error("您传入的日期格式是错误的格式应为YYYY-MM-DD")
        return
    }
}else{
    search.startTime = new Date(`${(new Date()).getFullYear()}-${(new Date()).getMonth() + 1}-${(new Date()).getDate()} 00:00:00`);
}
if(args[3]){
    if(/^\d{4}-\d{2}-\d{2}$/.test(args[3])){
        search.endTime =Date.parse(new Date(args[3] + " 23:59:59"));
    }else{
        console.error("您传入的日期格式是错误的格式应为YYYY-MM-DD")
        return
    }
}else{
    search.endTime = Date.parse(new Date(`${(new Date()).getFullYear()}-${(new Date()).getMonth() + 1}-${(new Date()).getDate()} 23:59:59`));
}
if(search.startTime > search.endTime){
    console.error("您传入的开始时间大于结束时间")
    return
}
sql = 'select id,ip,port,protocol,unusefulaccount,usefulaccount from proxy_info_new where source ="www.66ip.cn" and createtime > "' + moment(search.startTime).format("YYYY-MM-DD HH:ss:mm") + '" and createtime < "'+ moment(search.endTime).format("YYYY-MM-DD HH:ss:mm")+'"';
if(args[4]){
    search.type = args[4];
    sql = sql + " and protocol = '" + search.type.toUpperCase() + "'";
}
let i = 0;
connection.query(sql,(error, results, fields)=>{
    if(error){
        throw error;
    }
    console.log(`共${results.length}条信息`)
    var timer = setInterval(()=>{
        if(i == results.length ){
            clearInterval(timer);
            setTimeout(()=>{
                process.exit();
            },6000)
        }
        console.log(`开始检测第${i}/${results.length}条信息`)
        checkProxy(results[i]).then((proxy)=>{}).catch((proxy)=>{})
        i++;   
    },3000)
    
})

function checkProxy(proxy) {
    if(proxy.protocol == "未知"){
        let proxyagent = new HttpProxyAgent(`https://${proxy.ip}:${proxy.port}`);
        options = {
            port:'443',
            host:'www.taobao.com',
            path:"/",
            method:'GET',
            agent:proxyagent,
        }
        return new Promise((resolve, reject)=>{
            https.get(options,(res)=>{
               let sql = `update proxy_info_new set usefulaccount=${proxy.usefulaccount * 1 + 1} , protocol="HTTPS", useful=1, checktime='${moment(Date.now()).format("YYYY-MM-DD HH:ss:mm")}' where id=${proxy.id}`
               connection.query(sql,(err,result,fields)=>{if(err){throw err}else{console.log(`https://${proxy.ip}:${proxy.port}可用`)}})
               resolve(proxy)
            }).on('error', (e) => {
                let sql = `update proxy_info_new set unusefulaccount=${proxy.unusefulaccount * 1 + 1} , useful=0,protocol="HTTP", checktime='${moment(Date.now()).format("YYYY-MM-DD HH:ss:mm")}' where id=${proxy.id}`
                connection.query(sql,(err,result,fields)=>{if(err){throw err}else{console.log(`https://${proxy.ip}:${proxy.port}不可用,协议修改为http`)}})
                reject(proxy)
            })
        })
    }else{
        let proxyagent = new HttpProxyAgent(`${proxy.protocol.toLowerCase()}://${proxy.ip}:${proxy.port}`);
        let get,options;
        if(proxy.protocol.toLowerCase() == "https"){
            options = {
                port:'443',
                host:'www.taobao.com',
                path:"/",
                method:'GET',
                agent:proxyagent,
            }
            get = https.get;
        }else{
            options = {
                port:'80',
                host:'nodejs.cn',
                path:"/",
                method:'GET',
                agent:proxyagent,
            }
            get = http.get;
        }
        
        return new Promise((resolve, reject)=>{
            get(options,(res)=>{
               let sql = `update proxy_info_new set usefulaccount=${proxy.usefulaccount * 1 + 1} , useful=1, checktime='${moment(Date.now()).format("YYYY-MM-DD HH:ss:mm")}' where id=${proxy.id}`
               connection.query(sql,(err,result,fields)=>{if(err){throw err}else{console.log(`${proxy.protocol.toLowerCase()}://${proxy.ip}:${proxy.port}可用`)}})
               resolve(proxy)
            }).on('error', (e) => {
                let sql = `update proxy_info_new set unusefulaccount=${proxy.unusefulaccount * 1 + 1} , useful=0, checktime='${moment(Date.now()).format("YYYY-MM-DD HH:ss:mm")}' where id=${proxy.id}`
                connection.query(sql,(err,result,fields)=>{if(err){throw err}else{console.log(`${proxy.protocol.toLowerCase()}://${proxy.ip}:${proxy.port}不可用`)}})
                reject(proxy)
            })
        })
    }   
    
}