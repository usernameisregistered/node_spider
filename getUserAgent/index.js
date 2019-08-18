#!/usr/bin/node 
const http = require("http");
const cheerio = require("cheerio");
const url = 'http://www.useragentstring.com/pages/useragentstring.php?typ=Browser';
const fs = require("fs");

http.get(url,function(res){
    const { statusCode } = res;
    if (statusCode !== 200) {
        console.error(`请求失败。状态码: ${statusCode}`);
        res.resume();
        return;
    }else{
        console.log(`请求发送成功。请稍候...`);
    }
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            console.log(`请求响应成功。请稍候...`);
            const $ = cheerio.load(rawData);
            let json = getName($);
            console.log(`内容获取完成，正在写入！`);
            writeCotent(json);
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`报错: ${e.message}`);
});

function getName($){
    let obj = {};
    let size = $('#liste').find('h4').length;
    for(let i = 0 ; i < size ; i++){
        let key = $('#liste').find('h4').eq(i).text();
        console.log(`获取第${i}条${key}的信息`);
        obj[key] = getInfo($,i);
    }
    return obj;
}

function getInfo($,i){
    let ul = $('#liste h4').eq(i).next();
    let size = ul.find("li").length;
    let tempArr = [];
    for(let j = 0 ; j < size ; j++){
        if(ul.find("li").eq(j).find('a')){
            tempArr.push(ul.find("li").eq(j).find('a').text());
        }
    }
    return tempArr;
}

function writeCotent(content){
    fs.writeFile('./userAgent.json',JSON.stringify(content,null,4),(err)=>{
        if(err){
            console.log(`文件写入失败，${e.message}`);
        }else{
            console.log(`文件写入成功`);
        }
    })
}