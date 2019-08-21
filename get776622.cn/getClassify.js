#!/usr/bin/node
const https = require("https")
const cheerio = require("cheerio")
const fs = require("fs")
const path = require("path")
const getOneAgent = require("../common/randomGetAgent").getOneAgent
const process = require("process");
let classifyList = [];
let options = {
    host: 'www.776622.cn',
    port: 80,
    path: `/`,
    method: 'GET',
}
function getHtml(path) {
    return new Promise((resolve,reject)=>{
        options.path = path;
        options.headers["user-agent"] = getOneAgent();
        console.log(`请求：https://${options.host}${options.path}`)
        https.get(options, function (res) {
            const { statusCode } = res;
            if (statusCode !== 200) {
                console.error(`请求失败。状态码: ${statusCode}`);
                res.resume();
                reject({message:`请求失败。状态码: ${statusCode}`,code:statusCode})
            } else {
                console.log(`请求发送成功。请稍候...`);
                let result = '';
                res.on("data", (chunk) => { result += chunk })
                res.on('end', () => {
                    console.log(`数据加载完成...`);
                    const $ = cheerio.load(result);
                    resolve($);
                });
            }
    
        }).on('error', (e) => {
            reject({message:'e.message',code:'custom'})
        });
    })
}
function getClassify($) {
    let size = $('.header>font>subnav ul li').length;
    console.log("开始获取标签组信息")
    for (let i = 0; i < size; i++) {
        let el = $('.header>font>subnav ul').eq(i).find('li a');
        let tempObj = {};
        tempObj.zhname = el.text()
        tempObj.path = el.attr("href")
        tempObj.enname = tempObj.path.match(/^\/(\w*)\//)[1]
        tempObj.addtime = Date.now()
        tempObj.tags = [];
        classifyList.push(tempObj)
    }
}


getHtml("/").then(($)=>{
    getClassify($);
}).catch((err)=>{console.log(err.message)})

function getTag(){
    let size = $('.channel-nav ul li').length;
    console.log("开始获取标签信息")
    let tagList=[];
    for (let i = 0; i < size; i++) {
        let el = $('.channel-nav ul').eq(i).find('li a');
        let tempObj = {};
        tempObj.zhname = el.find("span").text()
        tempObj.path = el.attr("href").slice(16)
        tempObj.enname = tempObj.path.match(/\/(\w*)\/$/)[1]
        tempObj.addtime = Date.now()
        tagList.push(tempObj)
    }
    return tagList;
}

function writeCotent() {
    fs.writeFile(`./${classify}/classify.json`, JSON.stringify(classifyList, null, 4), (err) => {
        if (err) {
            console.log(`文件写入失败，${err.message}`);
        } else {
            console.log(`文件写入成功`);
            process.exit()
        }
    })
}