const fs = require('fs');

let cat1Name = ["", "*推荐", "*最新", "编程语言", "大数据", "区块链", "数据库", "系统架构", "其它", "AI/算法", "前端",
    "移动开发", "互联网+", "基础知识", "其它岗位", "Web框架", "笔试面试", "知识图谱"];
var cat2Name = new Array();
cat2Name[0] = [];
cat2Name[1] = [];
cat2Name[2] = [];
cat2Name[3] = ["", "Java", "C/C++", "C#", "Python", "PHP", "Shell", "Sql", "其它"];//"编程语言"
cat2Name[4] = ["", "Hadoop", "Spark", "Storm", "Hive", "xxx", "其它", "Hbase", "Kafka", "Elasticsearch", "Zookeeper",
    "数据搜集", "数据存储", "数据处理", "任务调度", "数据查询", "消息系统", "分布式协调服务", "数据可视化", "MapReduce", "Flink",
    "实时计算", "离线计算"];//"大数据"
cat2Name[5] = [];
cat2Name[6] = ["", "关系数据库", "NoSql", "缓存", "分布式存储", "图数据库", "其它", "Mysql", "Oracle", "Redis", "memcached",
    "键值数据库", "列存储数据库", "文档数据库", "消息队列", "RabbitMQ", "ZeroMQ", "ActiveMQ"];//"数据库"
cat2Name[7] = [];
cat2Name[8] = ["", "xxx", "笔试面试", "设计模式", "Linux", "xxx", "其它", "IT资讯", "产品设计", "测试", "运营",
    "运维", "Web服务器", "搜索引擎", "开发工具", "操作系统", "网络", "Linux", "项目管理"];//"经典"
cat2Name[9] = ["", "简单算法", "机器学习", "深度学习", "其它", "数学", "智力", "NLP", "LeetCode", "Kaggle"];//AI/算法
cat2Name[10] = ["", "Html", "Css", "Javascript", "其它", "jQuery", "Bootstrap", "React", "Vue", "Angular"];//"前端"
cat2Name[11] = ["", "Android", "IOS", "微信开发", "其它"];//移动开发
cat2Name[12] = ["", "互联网+金融", "互联网+交通", "互联网+医疗", "互联网+教育", "物联网", "其它"];//移动开发
cat2Name[13] = ["", "操作系统", "网络", "微服务", "设计模式", "区块链", "其它"];//其它技术
cat2Name[14] = ["", "产品", "测试", "项目管理", "运营", "hr面", "其它"];//其它岗位
cat2Name[15] = ["", "Spring", "Struts", "Ibatis", "Hibenate", "其它"];//web 框架
cat2Name[16] = ["", "经验", "实习", "社招", "校招", "考研", "兼职", "创业"];//笔试面试
cat2Name[17] = ["", "业界应用", "JanusGraph", "Neo4j", "Graphx", "图存储", "图计算",];//笔试面试
let result = []
for (let item in cat1Name) {
    if (cat1Name[item]) {
        let obj = {}
        obj.id = item;
        obj.name = cat1Name[item];
        obj.children = []
        for (let key in cat2Name[item]) {
            if (cat2Name[item][key]) {
                let children = {}
                children.id = key;
                children.name = cat2Name[item][key];
                obj.children.push(children)
            }
        }
        result.push(obj)
    }
}
fs.writeFileSync("./info/classify.json",JSON.stringify(result,null,4))