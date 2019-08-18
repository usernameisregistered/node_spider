const http = require('http');
const https = require('https');
const HttpProxyAgent = require('http-proxy-agent');
const util = require('util');
exports.checkProxy = function (proxy) {
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
            resolve('httpstrue')
        }).on('error', (e) => {
            reject('httpsfalse')
        })
    })
}
