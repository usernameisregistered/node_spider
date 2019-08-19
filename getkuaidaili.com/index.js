#!/usr/bin/node
const https = require("https");
const cheerio = require("cheerio");
const fs = require("fs");
const net = require("net");
const getOneAgent = require("../common/randomGetAgent").getOneAgent;
const checkProxy = require("../common/checkProxy").checkProxy;
let page = 55;
let usefulList=[];
let  current = 0;
function getHtml() {
    let options = {
        host:'www.kuaidaili.com',
        port:443,
        path:`/free/intr/${page}/`,
        method: 'GET',
        headers:{
            "user-agent":getOneAgent(),
        }
    }
    console.log(`请求：https://${options.host}${options.path}`)
    https.get(options, function (res) {
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
    checkProxy(list[current]).then((data)=>{
        console.log(`proxy ${list[current].protocol.toLowerCase()}://${list[current].ip}:${list[current].port}可用`)
        list[current].useful=1
        list[current].checktime=Date.now()
        usefulList.push(list[current])
        current++
        if(current <list.length){
            checkIpAPort(list)
        }else {
            writeCotent(usefulList)
        }
    }).catch(err=>{
        console.log(`proxy ${list[current].protocol.toLowerCase()}://${list[current].ip}:${list[current].port}不可用`)
        list[current].useful=0
        list[current].checktime=Date.now()
        usefulList.push(list[current])
        current++
        if(current <list.length){
            checkIpAPort(list)
        }else {
            writeCotent(usefulList)
        }
    })
}
function writeCotent(content) {
    fs.writeFile(`./intr/page_${page}.json`, JSON.stringify(content, null, 4), (err) => {
        if (err) {
            console.log(`文件写入失败，${e.message}`);
        } else {
            console.log(`文件写入成功`);
            usefulList= [];
            current = 0 ;
            if (page < 100) {
                page++;
                getHtml()
            }
        }
    })
}
getHtml(page)