#!/usr/bin/node
const fs = require("fs");
const connection = require("../common/connectSQL").connection
const path = require("path")
const process = require("process")
var moment = require('moment')
let data = {
    "nn": {
        successArr: [],
        errorArr: []
    },
    "nt": {
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
            for (let item of result) {
                console.log(`${path.join(__dirname, type, item)}文件内容读取开始`)
                let data = JSON.parse(fs.readFileSync(path.join(__dirname, type, item)));
                successArr.push(item.split("_")[1].split(".")[0] * 1);
                for (let value of data) {
                    sql += `('${value.ip}','${value.port}',${value.cryptonym == "高匿" ? 1 : 2},'${value.protocol}','${value.position.trim()}','${moment(value.createtime).format("YYYY-MM-DD HH:ss:mm")}',${value.useful},'${moment(value.checktime).format("YYYY-MM-DD HH:ss:mm")}'), `
                }
                console.log(`${path.join(__dirname, type, item)}文件内容读取完成`)
            }
            data[type].successArr = successArr.sort((a,b)=>{return a*1-b*1});
            resolve()
        })
    })
}
readFile("nn").then(() => {
    readFile("nt").then(() => {
        let stat =  fs.statSync("./log/writeSql.json").isFile();
        let content = '';
        if(stat){
            content = JSON.parse(fs.readFileSync("./log/writeSql.json"));
            content["nn"].successArr = content["nn"].successArr.concat(data.inha.successArr)
            let max = content["nn"].successArr[content["nn"].successArr.length -1]
            content["nn"].errorArr = [];
            for(let i = 1 ;i < max;i++){
                if(content["nn"].successArr.indexOf(i) == -1){
                    content["nn"].errorArr.push(i*1)
                }
            }
            content["nt"].successArr = content["nt"].successArr.concat(data.inha.successArr)
            content["nt"].errorArr = [];
            max = content["nt"].successArr[content["nt"].successArr.length -1]
            for(let i = 1 ;i < max;i++){
                if(content["nt"].successArr.indexOf(i) == -1){
                    content["nt"].errorArr.push(i*1)
                }
            }
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
                connection.query(sql, function (error, results, fields) {
                    if (error) throw error;
                    console.log('数据插入成功');
                    connection.end();
                    console.log('关闭数据库连接');
                    rmdir(path.join(__dirname,'nn'),()=>{
                        console.log(`文件夹${path.join(__dirname,'nn')}删除成功`)
                        rmdir(path.join(__dirname,'nt'),()=>{
                            console.log(`文件夹${path.join(__dirname,'nt')}删除成功`)
                            process.exit()
                        })
                    })
                });
            }
        })
    });
}).catch(err => { throw err });
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


