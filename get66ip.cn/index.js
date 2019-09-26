#!/usr/bin/node
const  areaList = ["","北京","上海","天津","重庆","河北","山西","辽宁","吉林","黑龙江","江苏","浙江","安徽","福建","江西","山东","河南","湖北","湖南","广东","海南","四川","贵州","云南","陕西","甘肃","青海","台湾","内蒙古","广西","西藏","宁夏","新疆","香港","澳门"]
const http = require("http")
const cheerio = require("cheerio")
const fs = require("fs")
const iconv = require('iconv-lite');
const process = require("process")
let getOneAgent = require("../common/randomGetAgent").getOneAgent;
let errInof = [];
let page = 1;
let index = 1;
function getHtml() {
    // let proxy = {protocol:'https',ip:'123.101.110.50',port:"9999"}
    // let proxyagent = new HttpProxyAgent(`${proxy.protocol.toLowerCase()}://${proxy.ip}:${proxy.port}`);
    let options = {
        host: 'www.66ip.cn',
        port: 80,
        path: `/areaindex_${index}/${page}.html`,
        method: 'GET',
        headers: {
            "user-agent": getOneAgent(),
        },
    }
    console.log(`请求：http://${options.host}${options.path}`)
    http.get(options, function (res) {
        const { statusCode } = res;
        if (statusCode !== 200) {
            errInof.push(`http://${options.host}${options.path}`);
            console.error(`请求失败。状态码: ${statusCode}`);
            res.resume();
            return;
        } else {
            console.log(`请求发送成功。请稍候...`);
            let result = [];
            res.on("data", (chunk) => {result.push(chunk)})
            res.on('end', () => {
                console.log(`数据加载完成...`);
                const $ = cheerio.load(iconv.decode(Buffer.concat(result),"gb2312"));
                getInfo($);
            });
        }

    }).on('error', (e) => {
        console.error(`请求失败。状态码: ${e.message}`);
        errInof.push(`http://${options.host}${options.path}`);
    });
}


function getInfo($) {
    let size = $('#footer tbody tr').length;
    let list = [];
    for (let i = 1; i < size; i++) {
        let el = $('#footer tbody tr').eq(i).find('td');
        let tempObj = {};
        tempObj.ip = el.eq(0).text().trim()
        console.log(`获取第${i}条/${size}代理IP${tempObj.ip}的信息`);
        tempObj.port = el.eq(1).text().trim();
        tempObj.protocol = "未知";
        tempObj.position = el.eq(2).text().trim();
        tempObj.cryptonym = el.eq(3).text().trim();
        tempObj.createtime = Date.now()
        list.push(tempObj);
    }
    fs.writeFileSync(`./data/page_${areaList[index]}.json`,JSON.stringify(list, null, 4));  
}
getHtml();
let timer = setInterval(() => {
    index++;
    if(index == areaList.length){
        clearInterval(timer);
        setTimeout(() => {
            fs.writeFileSync(`./data/errInof.json`,JSON.stringify(errInof, null, 4));  
            process.exit();
        }, 3000);
    }else{
        getHtml();
    }
}, 30 * 1000);