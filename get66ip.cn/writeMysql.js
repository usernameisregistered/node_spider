#!/usr/bin/node
const fs = require("fs");
const connection = require("../common/connectSQL").connection
const path = require("path")
const process = require("process")
var moment = require('moment')
let data = {
    successArr: [],
    errorArr: []
}
let sql = '';
function readFile(type) {
    return new Promise((resolve, reject) => {
        fs.readdir(path.join(__dirname, type), (err, result) => {
            if (err) {
                reject(err)
            }
            let successArr = [];
            for (let item of result) {
                console.log(`${path.join(__dirname, type, item)}文件内容读取开始`)
                let data = JSON.parse(fs.readFileSync(path.join(__dirname, type, item)));
                if(item == "errInof.json"){
                    continue
                }
                successArr.push(item.split("_")[1].split(".")[0] * 1);
                for (let value of data) {
                    sql += `('${value.ip}','${value.port}',${value.cryptonym == "高匿代理" ? 1 : 2},'${value.protocol}','${value.position}','${moment(value.createtime).format("YYYY-MM-DD HH:ss:mm")}',1,0,1,'www.66ip.cn'), `
                }
                console.log(`${path.join(__dirname, type, item)}文件内容读取完成`)
            }
            data.successArr = successArr.sort((a,b)=>{return a*1-b*1});
            resolve()
        })
    })
}
readFile("data").then(() => {
    sql = 'insert into proxy_info_new (ip,port,cryptonym,protocol,position,createtime,useful,unusefulaccount,usefulaccount,source) values ' + sql.slice(0,sql.length-2) + ";";
    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        console.log('数据插入成功');
        connection.end();
        console.log('关闭数据库连接');
        rmdir(path.join(__dirname,"data"),()=>{
            console.log(`文件夹${path.join(__dirname,"data")}删除成功`)
        })
    });
});
/**
 * 
 * @param {string} dir 
 * @param {function} callback 
 * @description 递归删除文件夹
 */
function rmdir (dir, callback) {
    fs.readdir(dir, (err, files) => {
        function next(index) {
            if (index == files.length) return fs.rmdir(dir, callback)
            let newPath = path.join(dir, files[index])
            fs.stat(newPath, (err, stat) => {
                if (stat.isDirectory() ) {
                    rmdir(newPath, () => next(index+1))
                } else {
                    fs.unlink(newPath, () => next(index+1))
                }
            })
        }
        next(0)
    })
}


