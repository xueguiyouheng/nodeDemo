var User = require("../models/User.js");
var Tiezi = require("../models/Tiezi.js");
var _ = require("../models/underscore.js");
var formidable = require('formidable');
var path = require("path");
var gm = require('gm');


//显示首页
exports.showIndex = function(req,res){
    //显示首页
    if(req.session.login){
        //如果用户已经登陆了，那么需要检索这个用户的信息
        User.getuserinfo(req.session.yonghuming , function(yonghu) {
            console.log(111)
            res.render("index", {
                "login": true,
                "yonghuming": yonghu.yonghuming,
                "touxiangurl" : "/public/avatar/" + yonghu.yonghuming + ".jpg",
                "nicheng" : yonghu.nicheng
            });
        });
    }else{
        res.render("index", {
            "login": false,
            "yonghuming": null,
            "touxiangurl" : "/public/avatar/0.jpg",
            "nicheng" : null
        });
    }
}

//显示注册
exports.showRegist = function(req,res){
    res.render("regist");
}

//做注册，Ajax接口，要显示一个结果字符串
exports.doRegist = function(req,res){
    //formidable的语法
    var form = new formidable.IncomingForm();
    //formidable的语法
    form.parse(req, function(err, fields, files) {
        var yonghuming = fields.yonghuming;
        var mima = fields.mima;

        //检查用户名和密码是不是空的
        if(!yonghuming || !mima){
            res.send("CUOWU");
            return;
        }

        //正则，用户名只能是英语和数字，长度最少5位，最长18位
        if(!/^[A-Za-z0-9]{5,18}$/.test(yonghuming)){
            res.send("YONGHUMINGFEIFA");
            return;
        }
        //密码长度检查
        if(mima.length < 6){
            res.send("MIMAFEIFA");
            return;
        }
        //执行注册
        User.regist(yonghuming,mima,function(result){
            res.send(result);
        });
    });
}

//检测用户名是否存在
exports.checkyonghuming = function(req,res){
    User.jiachayonghumingshifoucunzai(req.query.yonghuming,function(data){
        res.send(data);
    });
}

//登陆
exports.showLogin = function(req,res){
    res.render("login");
}

//验证登陆
exports.logincheck = function(req,res){
    console.log(11)
    //formidable的语法
    var form = new formidable.IncomingForm();
    //formidable的语法
    form.parse(req, function(err, fields, files) {
        var yonghuming = fields.yonghuming;
        var mima = fields.mima;


        User.checklogin(yonghuming,mima,function(result){
            if(result == "YONGHUMINGBUCUNZAI"){
                res.send("YONGHUMINGBUCUNZAI");
            }else if(result == "MIMACUOWU"){
                res.send("MIMACUOWU");
            }else if(result == "CHENGGONG"){
                //写session
                req.session.login = true;
                req.session.yonghuming = yonghuming;

                res.send("CHENGGONG");
            }
        });
    });
};

//更改资料
exports.showProfile = function(req,res){
    //使用这个页面的用户，要求已经登陆
    if(!req.session.login){
        res.send("你还没有登陆，请登陆");
        return;
    }

    //先读取这个用户的信息
    User.getuserinfo(req.session.yonghuming , function(yonghu){
        //显示profile.ejs页面，然后有一些数据绑定：
        res.render("profile",{
            "yonghuming" : yonghu.yonghuming,
            "nicheng" : yonghu.nicheng,
            "jianjie" : yonghu.jianjie,
            "avatar" : yonghu.avatar,
            "yonghutouxiang" : "/public/avatar/" + yonghu.yonghuming + ".jpg"
        });
    })
}

//更改个人资料
exports.changeprofile = function(req,res){
    //formidable的语法
    var form = new formidable.IncomingForm();
    //配置上传文件夹
    form.uploadDir = "./uploads";
    //formidable的语法
    form.parse(req, function(err, fields, files) {
        var obj = {
            "nicheng" : fields.nicheng,
            "jianjie" : fields.jianjie,
            "avatar" : files.avatar
        }



        //如果用户没用更改头像，此时保存数据库，跳转到首页
        User.changeprofile(req.session.yonghuming , obj , function(err){
            if(err){
                res.send("更改失败");
                return;
            }
            //如果用户上传了图片，那么跳转到切图页面。
            if(files.avatar.size != 0){
                res.redirect("/cut?pic=" + path.parse(files.avatar.path).name);
            }else{
                res.send('个人资料更改成功，3秒后返回首页<script>setTimeout(function(){window.location = "/"},3000)</script>');
            }
        })
    });
}

//切图页面
exports.showCut = function(req,res,next){
    //这个页面要求sesssion，如果没有session，要求登录
    if(!req.session.yonghuming){
        res.send("本页面要求登录，请<a href=/login>登录</a>");
        return;
    }
    //这个页面现在接受一个get请求，可以有pic参数
    var picurl = "/uploads/" + req.query.pic;
    //呈递cut模板
    res.render("cut",{
        "yonghuming" : '固定待开发',
        "imgurl" : picurl
    });
}


exports.docut = function(req,res){
    var w = parseInt(req.query.w);
    var h = parseInt(req.query.h);
    var x = parseInt(req.query.x);
    var y = parseInt(req.query.y);
    var pic = "./" + req.query.pic;
    var yonghuming = req.session.yonghuming;

    gm(pic).crop(w, h, x, y).resize(100,100,"!").write("./public/avatar/"+ yonghuming + ".jpg",function(err){
        if(err){
            console.log("失败");
            res.send("FAIL");
            return;
        }
        console.log("成功");
        res.send("OK");
    });
}


//发表帖子
exports.doFabiao = function(req,res,next) {
    //formidable的语法
    var form = new formidable.IncomingForm();
    //formidable的语法
    form.parse(req, function (err, fields, files) {
        //参数
        var yonghuming = req.session.yonghuming;
        var content = fields.content;

        //Tiezi类提供的静态方法，能够保存这个帖子
        Tiezi.fabiao(yonghuming,content,function(err){
            if(err){
                res.send("WRONG");
            }else{
                res.send("OK");
            }
        });
    });
}

//列出所有帖子
exports.list = function(req,res){
    Tiezi.liechusuoyoutiezi(function(err,results){
        var arr = [];

        iteratoer(results.length - 1);

        function iteratoer(i){
            var obj = {};
            console.log(obj)
            if(i == -1){
                res.json({"jieguo" : arr});
                return;
            }
            User.getuserinfo(results[i].yonghuming,function(user){
                if(user){
                    console.log(user.nicheng , user.avatar)
                    obj._id = results[i]._id;
                    obj.yonghuming = user.yonghuming;
                    obj.content = results[i].content;
                    obj.time = results[i].time;
                    obj.nicheng = user.nicheng;
                    obj.touxiang = user.avatar;
                    arr.push(obj);
                }

                iteratoer(--i);
            });
        }
    })
}


//显示首页
exports.showUser = function(req,res){
    //显示首页
    console.log('显示用户个人页')
    if(req.session.login){
        console.log(1)
        //如果用户已经登陆了，那么需要检索这个用户的信息
        User.getuserinfo(req.session.yonghuming , function(denglu) {
            User.getuserinfo(req.params["username"],function(user){
                Tiezi.liechumougerendetiezi(req.params["username"],function(err,results){
                    res.render("user", {
                        "login": true,
                        "yonghuming": denglu.yonghuming,
                        "touxiangurl" : "/public/avatar/" + denglu.yonghuming + ".jpg",
                        "nicheng" : denglu.nicheng,
                        "useryonghuming" : user.yonghuming,
                        "usernicheng" : user.nicheng,
                        "userjianjie" : user.jianjie,
                        "usertouxiang" : user.avatar ?  "/public/avatar/" + user.yonghuming + ".jpg" : "/public/avater/0.jpg",
                        "tieziarray" : results
                    });
                });    
            });
        });
    }else{
        console.log(2)
        User.getuserinfo(req.params["username"],function(user){
            Tiezi.liechumougerendetiezi(req.params["username"],function(err,results){
                res.render("user", {
                    "login": false,
                    "yonghuming": null,
                    "touxiangurl" : "/public/avatar/0.jpg",
                    "nicheng" : null,
                    "useryonghuming" : user.yonghuming,
                    "usernicheng" : user.nicheng,
                    "userjianjie" : user.jianjie,
                    "usertouxiang" : user.avatar ?  "/public/avatar/" + user.yonghuming + ".jpg" : "/public/avater/0.jpg",
                    "tieziarray" : results
                });
            });
        });
    }
}

exports.showShuoshuo = function(req,res){
    var idstring = req.params["idstring"];
    console.log(idstring,'idstring')
    Tiezi.getTiezibyidstring(idstring,function(err,results){
        if(err){
            res.send("错误");
            return;
        }
        if(results.length != 0){
            res.send(results[0].content);
        }
    });
}
//评论
exports.pinlun = function (req,res) {
    console.log('评论')
    res.send();
}