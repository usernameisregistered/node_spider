const connection = require("../common/connectSQL").connection;
const fs = require("fs");
let sql='select useragent from user_agent where isgeneral=1 and version > 10';

connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    let useragentList = [];
    for(let item of results){
        useragentList.push(item.useragent)
    }
    fs.writeFile(`./generalUserAgent.json`,JSON.stringify(useragentList,null,4),(err)=>{
        if(err){
            throw err;
        }
        console.log("文件写入成功")
    })
});
connection.end();