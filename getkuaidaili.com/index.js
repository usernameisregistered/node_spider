#!/usr/bin/node
const https = require("https")
const cheerio = require("cheerio")
const fs = require("fs")
const path = require("path")
const getOneAgent = require("../common/randomGetAgent").getOneAgent
const checkProxy = require("../common/checkProxy").checkProxy
const process = require("process");
let args = process.argv;
let page, maxPage, type;
let usefulList = [];
let current = 0; // 当前遍历数组的索引
if (args.length != 5) {
    console.log("缺少必要的参数")
} else {
    page = args[2] ? args[2] : 0; //当前页数
    maxPage = args[3] ? args[3] * 1 : 0;// 要请求的最大页数
    type = args[4] && args[4] == 1 ? "inha" : 'intr';
    fs.stat(path.join(__dirname, "inha"), (err, stat) => {
        if (!stat || !stat.isDirectory()) {
            console.log("创建必要的文件夹inha")
            fs.mkdirSync(path.join(__dirname, "inha"))
        }
        fs.stat(path.join(__dirname, "intr"), (err, stat) => {
            if (!stat || !stat.isDirectory()) {
                console.log("创建必要的文件夹intr")
                fs.mkdirSync(path.join(__dirname, "intr"))
            }
            getHtml();
        })
    })
}
function getHtml() {
    let options = {
        host: 'www.kuaidaili.com',
        port: 443,
        path: `/free/${type}/${page}/`,
        method: 'GET',
        headers: {
            "user-agent": getOneAgent(),
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
                console.log(`数据加载完成...`);
                const $ = cheerio.load(result);
                getInfo($);
            });
        }

    }).on('error', (e) => {
        console.error(`报错: ${e.message}`);
    });
}


function getInfo($) {
    let size = $('#list table tbody tr').length;
    if (size == 0) {
        console.log(`在请求type为${type}页数为${page}发生了错误`)
        page++;
        getHtml();
    } else {
        console.log("开始获取代理信息")
        let list = [];
        for (let i = 0; i < size; i++) {
            console.log(`获取第${i + 1}条代理的信息`);
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
}

function checkIpAPort(list) {
    checkProxy(list[current]).then((data) => {
        console.log(`第${current}/${list.length}条proxy信息： ${list[current].protocol.toLowerCase()}://${list[current].ip}:${list[current].port}可用`)
        list[current].useful = 1
        list[current].checktime = Date.now()
        usefulList.push(list[current])
        current++
        if (current < list.length) {
            checkIpAPort(list)
        } else {
            writeCotent(usefulList)
        }
    }).catch(err => {
        console.log(`第${current}/${list.length}条proxy信息 ${list[current].protocol.toLowerCase()}://${list[current].ip}:${list[current].port}不可用`)
        list[current].useful = 0
        list[current].checktime = Date.now()
        usefulList.push(list[current])
        current++
        if (current < list.length) {
            checkIpAPort(list)
        } else {
            writeCotent(usefulList)
        }
    })
}
function writeCotent(content) {
    fs.writeFile(`./${type}/page_${page}.json`, JSON.stringify(content, null, 4), (err) => {
        if (err) {
            console.log(`文件写入失败，${err.message}`);
        } else {
            console.log(`文件写入成功`);
            usefulList = [];
            current = 0;
            if (page < maxPage) {
                page++;
                getHtml()
            } else {
                process.exit()
            }
        }
    })
}