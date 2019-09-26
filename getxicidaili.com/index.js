#!/usr/bin/node
const https = require("https")
const cheerio = require("cheerio")
const fs = require("fs")
const path = require("path")
const process = require("process")
const HttpProxyAgent = require('http-proxy-agent');
const args = process.argv
const moment = require("moment")
let page = args[5] ? args[5]*1 :1;
let getOneAgent = require("../common/randomGetAgent").getOneAgent;
let type = args[2] || 'nn';
let startTime = null;
let errInof = [];
if(args[3]){
    if(/^\d{4}-\d{2}-\d{2}$/.test(args[3])){
        startTime =Date.parse(new Date(args[3] + " 00:00:00"));
    }else{
        console.error("您传入的日期格式是错误的格式应为YYYY-MM-DD")
        return
    }
}else{
    startTime = new Date(`${(new Date()).getFullYear()}-${(new Date()).getMonth() + 1}-${(new Date()).getDate()} 00:00:00`);
}
let endTime = null;
if(args[4]){
    if(/^\d{4}-\d{2}-\d{2}$/.test(args[4])){
        endTime =Date.parse(new Date(args[4] + " 23:59:59"));
    }else{
        console.error("您传入的日期格式是错误的格式应为YYYY-MM-DD")
        return
    }
}else{
    endTime = Date.parse(new Date(`${(new Date()).getFullYear()}-${(new Date()).getMonth() + 1}-${(new Date()).getDate()} 23:59:59`));
}
if(startTime > endTime){
    console.error("您传入的开始时间大于结束时间")
    return
}
 fs.stat(path.join(__dirname, type), (err, stat) => {
    if (!stat || !stat.isDirectory()) {
        console.log("创建必要的文件夹"+type)
        fs.mkdirSync(path.join(__dirname, type))
    }
})
switch(type){
    case "nt":
        console.log("您请求的类型为国内普通代理请求的时间范围为"+moment(startTime).format("YYYY-MM-DD HH:ss:mm")+"~"+moment(endTime).format("YYYY-MM-DD HH:ss:mm"))
        getHtml();
        break;
    case "nn":
        console.log("您请求的类型为国高匿通代理请求的时间范围为"+moment(startTime).format("YYYY-MM-DD HH:ss:mm")+"~"+moment(endTime).format("YYYY-MM-DD HH:ss:mm"))
        getHtml();
        break;
    default:
        console.error("你要请求的类型不被允许")
}
function getHtml() {
    let proxy = {protocol:'https',ip:'123.101.110.50',port:"9999"}
    let proxyagent = new HttpProxyAgent(`${proxy.protocol.toLowerCase()}://${proxy.ip}:${proxy.port}`);
    let options = {
        host: 'www.xicidaili.com',
        port: 443,
        path: `/${type}/${page}/`,
        method: 'GET',
        headers: {
            "user-agent": getOneAgent(),
        },
        agent:proxyagent,
    }
    console.log(`请求：https://${options.host}${options.path}`)
    https.get(options, function (res) {
        const { statusCode } = res;
        if (statusCode !== 200) {
            errInof.push(`https://${options.host}${options.path}`);
            page++;
            getHtml();
            console.error(`请求失败。状态码: ${statusCode}`);
            res.resume();
            return;
        } else {
            console.log(`请求发送成功。请稍候...`);
            let result = '';
            res.on("data", (chunk) => { result += chunk })
            res.on('end', () => {
                console.log(`数据加载完成...`);
                const $ = cheerio.load(result);
                getInfo($);
            });
        }

    }).on('error', (e) => {
        errInof.push(`https://${options.host}${options.path}`);
        page++;
        getHtml();
    });
}


function getInfo($) {
    let size = $('#ip_list tbody tr').length;
    if (size == 0) {
        errInof.push(`https://${options.host}${options.path}`);
        console.log(`在请求type为${type}页数为${page}发生了错误`)
        page++;
        getHtml();
    } else {
        let list = [];
        for (let i = 1; i < size; i++) {
            let el = $('#ip_list tbody tr').eq(i).find('td');
            let tempObj = {};
            tempObj.ip = el.eq(1).text().trim()
            console.log(`获取第${i}条/${size}代理IP${tempObj.ip}的信息`);
            tempObj.port = el.eq(2).text().trim();
            tempObj.protocol = el.eq(5).text().trim();
            tempObj.position = el.eq(3).text().trim();
            tempObj.cryptonym = el.eq(4).text().trim();
            tempObj.createtime = Date.now()
            if(Date.parse(new Date("20" + el.eq(9).text() + ":00")) > startTime && Date.parse(new Date("20" + el.eq(9).text() + ":00")) < endTime){
                list.push(tempObj);
                break
            }
        }
        if((size  - 1)== list.length){
            fs.writeFileSync(`./${type}/page_${page}.json`,JSON.stringify(list, null, 4));
            page++
            getHtml()
        }else{
            fs.writeFileSync(`./${type}/page_${page}.json`,JSON.stringify(list, null, 4));
            fs.writeFileSync(`./${type}/errorInof.json`,JSON.stringify(errInof, null, 4));
            process.exit("代理信息获取完成")
        }
    }
}