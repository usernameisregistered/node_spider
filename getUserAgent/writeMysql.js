#!/usr/bin/node 
const fs = require("fs");
const connection = require("../common/connectSQL").connection
let userAgent = JSON.parse(fs.readFileSync('./userAgent.json'));
let sql='';
for(let key in userAgent){
    let index = key.lastIndexOf(" ");
    let classify = key.slice(0,index);
    let version = key.slice(index+1,key.length);
    for(let i = 0 ; i < userAgent[key].length ; i++){
        if(/(Internet Explorer|Chrome|Firefox|Opera|Safari)/.test(classify)){
            sql += `('${classify}','${version}','${userAgent[key][i]}',1,'${(new Date()).toLocaleString('chinese')}'),`
        }else{
            sql += `('${classify}','${version}','${userAgent[key][i]}',0,'${(new Date()).toLocaleString('chinese')}'),`
        }
    }
}
sql = 'insert into user_agent (classify,version,useragent,isgeneral,createtime) values ' + sql.replace(/,$/,';');
connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    console.log('数据插入成功');
});
connection.end();