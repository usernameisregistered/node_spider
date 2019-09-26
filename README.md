# node_spider

### getUserAgent
```
    node getUserAgent/index.js  // 获取userAgent
    node getUserAgent/writeMysql.js //将数据写入mysql
```

### getxicidaili.com

```
    node getkuaidaili.com/index.js type startTime endTime page  获取数据
    node getkuaidaili.com/checkProxy.js startTime endTime type
```

|参数名称|参数含义|默认值|类型|
|:-:|:-:|:-:|:-:|
|type|请求的页面类型 nn nn(国内高匿)|nt(国内普通)|string
|startTime|允许验证的开始时间|today 00:00:00|date|
|endTime|允许验证的结束时间|today 23:59:59|date|
|page|开始的页数|1|number|


|参数名称|参数含义|默认值|类型|
|:-:|:-:|:-:|:-:|
|startTime|允许验证的开始时间|today 00:00:00|date|
|endTime|允许验证的结束时间|today 23:59:59|date|
|type|协议的类型 HTTPS,HTTP |HTTPS| |string
