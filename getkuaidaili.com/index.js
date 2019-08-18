#!/usr/bin/node
const https = require("https");
const cheerio = require("cheerio");
const fs = require("fs");
const net = require("net");
const getOneAgent = require("../common/randomGetAgent").getOneAgent;
const checkProxy = require("../common/checkProxy").checkProxy;
let page = 1;

function getHtml() {
    let options = {
        host:'www.kuaidaili.com',
        port:443,
        path:`/free/inha/${page}/`,
        method: 'GET',
        headers:{
            "user-agent":getOneAgent(),
        }
    }
    console.log(`请求：https://${options.host}${options.path}`)
    https.get(options, function (res) {
        console.log(res)
        const { statusCode } = res;
        if (statusCode !== 200) {
            console.error(`请求失败。状态码: ${statusCode}`);
            res.resume();
            return;
        } else {
            console.log(`请求发送成功。请稍候...`);
            let result = '';
            res.on("data", (chunk) => { result += chunk })
            res.on('end', () => {
                const $ = cheerio.load(result);
                let proxyList = getInfo($);

                // checkIpAPort(proxyList).then((data)=>{
                //     console.log(data)
                // })
            });
        }

    }).on('error', (e) => {
        console.error(`报错: ${e.message}`);
    });
}


function getInfo($) {
    console.log("开始获取代理信息")
    let list = [];
    let size = $('#list table tbody tr').length;
    for (let i = 0; i < size; i++) {
        console.log(`获取第${i}条代理的信息`);
        let el = $('#list table.table tbody tr').eq(i).find('td');
        let tempObj = {};
        tempObj.ip = el.eq(0).text()
        tempObj.port = el.eq(1).text()
        tempObj.cryptonym = el.eq(2).text()
        tempObj.protocol = el.eq(3).text()
        tempObj.position = el.eq(4).text()
        tempObj.createtime = Date.now()
        list.push(tempObj)
    }
    checkIpAPort(list);
}

function checkIpAPort(list) {
    let usefulList=[];
    for(let item of list){
        console.log("开始检测代理IP"+item.ip+"是否可用");
        let res = yield checkProxy(item)
        console.log(res)
    }
    //console.log(usefulList)
}
function writeCotent(content) {
    fs.writeFile(`./info/page_${page}.json`, JSON.stringify(content, null, 4), (err) => {
        if (err) {
            console.log(`文件写入失败，${e.message}`);
        } else {
            console.log(`文件写入成功`);
            // if (page < 50) {
            //     page++;
            //     getHtml()
            // }
        }
    })
}
getHtml(page)