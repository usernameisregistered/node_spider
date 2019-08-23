const HttpProxyAgent = require('http-proxy-agent')
const http = require('http');
const fs = require('fs');
const cheerio = require("cheerio")
//let proxyagent = new HttpProxyAgent(`http://182.92.113.183:8118`);
const getOneAgent = require("../common/randomGetAgent").getOneAgent
let classifyInof = JSON.parse(fs.readFileSync("./info/classify.json"));
let beginPid = 3;
let beginId = 1;
let quesionList = [];
let options = {
    port: '80',
    host: 'www.k6k4.com',
    path: "/simple_question/qlist/10/0",
    method: 'GET',
    //agent: proxyagent,
    headers: {}
}
getQuestion();
function next() {
    if (classifyInof[beginPid] && beginId < classifyInof[beginPid].length) {
        beginId++;
    } else {
        if (beginPid < classifyInof.length) {
            beginPid++
            if (beginPid == 7) {
                beginPid = 8;
            }
            beginId = 1;
        } else {
            console.log("所有问题请求完成");
            fs.writeFileSync("./info/quesion.json",JSON.stringify(quesionList,null,4))
            process.exit()
            getAnswer();
        }
    }

}

function getAnswer() {
    options.headers["user-agent"] = getOneAgent();
    options.path = `/simple_question/qlist/${beginPid}/${beginId}`;
    http.get(options, (res) => {
        const { statusCode } = res;
        if (statusCode !== 200) {
            console.log(`请求失败。状态码: ${statusCode}`)
            res.resume();
            //getQuestion();
        } else {
            console.log(`请求发送成功。请稍候...`);
            let result = '';
            res.on("data", (chunk) => { result += chunk })
            res.on('end', () => {
                console.log(`数据加载完成...`);
                const $ = cheerio.load(result);
                let el = $("#qListTable tr");
                let length = el.length;
                if (length > 0) {
                    for (let i = 0; i < length; i++) {
                        let obj = {};
                        let element = el.eq(i).find("td .qtitle a");
                        obj.qusition = element.eq(0).text().split("、")[1].trim();
                        console.log(obj.qusition)
                        obj.answerUrl = "http://www.k6k4.com" + element.eq(0).attr("href");
                        obj.classifyId = beginPid;
                        obj.typeId = beginId;
                        obj.addtime = Date.now();
                        quesionList.push(obj);
                    }
                }
                next()
                getAnswer();
            });
        }
    }).on('error', (e) => {
        console.log(e.message)
        fs.writeFileSync("./info/quesion.json",JSON.stringify(quesionList,null,4))
        process.exit()
    })
}

function getQuestion() {
    options.headers["user-agent"] = getOneAgent();
    options.path = `/simple_question/qlist/${beginPid}/${beginId}`;
    http.get(options, (res) => {
        const { statusCode } = res;
        if (statusCode !== 200) {
            console.log(`请求失败。状态码: ${statusCode}`)
            res.resume();
           // getQuestion();
        } else {
            console.log(`请求发送成功。请稍候...`);
            let result = '';
            res.on("data", (chunk) => { result += chunk })
            res.on('end', () => {
                console.log(`数据加载完成...`);
                const $ = cheerio.load(result);
                let el = $("#qListTable tr");
                let length = el.length;
                if (length > 0) {
                    for (let i = 0; i < length; i++) {
                        let obj = {};
                        let element = el.eq(i).find("td .qtitle a");
                        obj.qusition = element.eq(0).text().split("、")[1].trim();
                        console.log(obj.qusition)
                        obj.answerUrl = "http://www.k6k4.com" + element.eq(0).attr("href");
                        obj.classifyId = beginPid;
                        obj.typeId = beginId;
                        obj.addtime = Date.now()
                        quesionList.push(obj);
                    }
                }
                next()
                getQuestion();
            });
        }
    }).on('error', (e) => {
        console.log(e.message)
        fs.writeFileSync("./info/quesion.json",JSON.stringify(quesionList,null,4))
        process.exit()
    })
}
