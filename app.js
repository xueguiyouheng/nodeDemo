var express = require("express");
var mongoose = require("mongoose");
var session = require('express-session');
var router = require("./controller/router.js");
//设置数据库连接
mongoose.connect("mongodb://localhost/tizi");

var app = express();

//配置session
app.use(session({
    //加密字符串 ，我们的sid随机字符串就是根据这个东西来加密的
    secret: 'testProject',
    // 过期时间，就是10天内免登陆
    expires : new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    // 两个默认的配置
    resave: false,
    saveUninitialized: true
}));

//静态文件夹
app.use("/public",express.static("public"));
app.use("/uploads",express.static("uploads"));
//模板引擎
app.set("view engine","ejs");

//路由清单
//页面路由
app.get("/"                 ,router.showIndex);         //显示首页
app.get("/regist"           ,router.showRegist);        //显示注册页面
app.get("/login"            ,router.showLogin);         //显示登陆
app.get("/profile"          ,router.showProfile);       //显示个人资料页
app.post("/changeprofile"   ,router.changeprofile);     //功能页。改变个人资料。
app.get("/cut"              ,router.showCut);           //显示切图页面。
app.get("/docut"            ,router.docut);             //功能页。切图。
app.post("/fabiao"          ,router.doFabiao);          //功能页。发表帖子。
app.get("/user/:username"   ,router.showUser);          //用户的个人页面
app.get("/shuoshuo/:idstring",router.showShuoshuo);     //说说的内容详情页面
app.get("/topic"            ,router.showTopic);         //显示话题页
app.get("/pinglun"          ,router.pinglun);           //评论接口

//数据接口
app.post("/logincheck"      ,router.logincheck);        //Ajax接口，登陆功能
app.post("/doregist"        ,router.doRegist);          //Ajax接口，注册功能
app.get("/checkyonghuming"  ,router.checkyonghuming);   //Ajax接口，检测用户名是否存在
app.get("/list"             ,router.list);              //Ajax接口，列出所有帖子，一个个字典

app.listen(3000);