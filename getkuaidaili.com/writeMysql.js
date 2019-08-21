#!/usr/bin/node
const fs = require("fs");
const connection = require("../common/connectSQL").connection
const path = require("path")
var moment = require('moment')
let data = {
    "inha": {
        successArr: [],
        errorArr: []
    },
    "intr": {
        successArr: [],
        errorArr: []
    }
}
let sql = '';
function readFile(type) {
    return new Promise((resolve, reject) => {
        fs.readdir(path.join(__dirname, type), (err, result) => {
            if (err) {
                reject(err)
            }
            let successArr = [];
            let errorArr = [];
            for (let item of result) {
                console.log(`${path.join(__dirname, type, item)}文件内容读取开始`)
                let data = JSON.parse(fs.readFileSync(path.join(__dirname, type, item)));
                successArr.push(item.split("_")[1].split(".")[0] * 1);
                for (let value of data) {
                    
                    sql += `('${value.ip}','${value.port}',${value.cryptonym == "高匿名" ? 1 : 2},'${value.protocol}','${value.position}','${moment(value.createtime).format("YYYY-MM-DD HH:ss:mm")}',${value.useful},'${moment(value.checktime).format("YYYY-MM-DD HH:ss:mm")}'), `
                }
                console.log(`${path.join(__dirname, type, item)}文件内容读取完成`)
                // console.log(`删除文件${path.join(__dirname,type,item)}`)
                // fs.unlinkSync(path.join(__dirname,type,item));
            }
            let max = successArr.sort()[successArr.length - 1];
            for (let i = 1; i < max; i++) {
                if (successArr.indexOf(i) == -1) {
                    errorArr.push(i * 1);
                }
            }
            data[type].successArr = successArr.sort((a,b)=>{return a - b});
            data[type].errorArr = errorArr.sort((a,b)=>{return a - b});
            resolve()
        })
    })
}
readFile("inha").then(() => {
    readFile("intr").then(() => {
        let stat =  fs.statSync("./log/writeSql.json").isFile();
        let content = '';
        if(stat){
            content = JSON.parse(fs.readFileSync("./log/writeSql.json"));
            content["inha"].successArr = content["inha"].successArr.concat(data.inha.successArr)
            content["inha"].errorArr = content["inha"].errorArr.concat(data.inha.errorArr)
            content["intr"].successArr = content["intr"].successArr.concat(data.inha.successArr)
            content["intr"].errorArr = content["intr"].errorArr.concat(data.inha.errorArr)
        }else{
            content = data;
        }
        fs.writeFile("./log/writeSql.json", JSON.stringify(content), (err, data) => {
            if (err) {
                console.log(`文件写入失败，${e.message}`);
            } else {
                console.log(`文件写入成功`);
                console.log('开始插入数据')
                sql = 'insert into proxy_info (ip,port,cryptonym,protocol,position,createtime,useful,checktime) values ' + sql.slice(0,sql.length-2) + ";";
                fs.writeFile("./log/test.sql",sql)
                connection.query(sql, function (error, results, fields) {
                    if (error) throw error;
                    console.log('数据插入成功');
                });
                connection.end();
            }
        })
    });
}).catch(err => { throw err });




