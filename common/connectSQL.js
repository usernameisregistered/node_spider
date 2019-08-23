const mysql      = require('mysql');
connection = mysql.createConnection({
    host     : '192.168.111.102',
    user     : 'root',
    password : '12345678',
    database : 'spider'
});
connection.connect(function(err) {
    if (err) {
      console.error('数据连接失败: ' + err.stack);
    }else{
        //console.log('数据连接成功：' + connection.threadId);
    }
});

exports.connection = connection;