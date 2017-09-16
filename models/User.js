var mongoose = require("mongoose");

//加密
var crypto = require("crypto");


//定义schema
var userSchema = mongoose.Schema({
    "yonghuming" 	:   String,
    "mima" 	        :   String,
    "avatar"        :   Boolean,
    "nicheng"       :   String,
    "jianjie"       :   String
});

//静态方法。注册方法。
userSchema.statics.regist = function(yonghuming,mima,callback){
    //备份this
    var self = this;
    //要检查用户名有没有重复
    this.find({"yonghuming" : yonghuming},function(err,results){
        if(err){
            callback("CUOWU");
            return;
        }
        //用户名已经被占用
        if(results.length != 0){
            callback("ZHANYONG");
            return;
        }

        //加密
        var hash = crypto.createHash('md5');
        var jiamizhihoudemima = hash.update(mima).digest("hex");

        //this就是User模型
        var obj = new self({
            "yonghuming"    : yonghuming,
            "mima"          : jiamizhihoudemima,
            "avatar"        : false,
            "nicheng"       : "无名用户",
            "jianjie"       : "这家伙很懒，什么都没留下"
        });

        obj.save(function(err){
            if(err){
                callback("CUOWU");
                return;
            }
            callback("CHENGGONG");
        });
    })
}

//静态方法。检查用户名是否存在
userSchema.statics.jiachayonghumingshifoucunzai = function(yonghuming,callback) {
    this.find({"yonghuming" : yonghuming},function(err,results) {
        if (err) {
            callback("CUOWU");
            return;
        }
        //用户名已经被占用
        if (results.length != 0) {
            callback("ZHANYONG");
        }else{
            callback("MEIYOUBEIZHANYONG");
        }
    });
}

//静态方法。得到用户信息
userSchema.statics.getuserinfo = function(yonghuming,callback) {
    this.find({"yonghuming" : yonghuming},function(err,results) {
        if(err){
            return;
        }
        callback(results[0]);
    });
}

//静态方法，验证登陆
userSchema.statics.checklogin = function(yonghuming,mima,callback){
    //所谓的验证是否登陆成功，就是从数据库中找有没有这个用户名。
    //如果有这个用户名，再比对加密之后的密码。
    this.find({"yonghuming" : yonghuming},function(err,result){
        //检查用户名是否存在
        if(result.length == 0){
            callback("YONGHUMINGBUCUNZAI");
        }else{
            //用户名存在，比对密码，注意，是加密的，比加密的
            var hash = crypto.createHash('md5');
            var jiamizhihoudemima = hash.update(mima).digest("hex");

            if(result[0].mima === jiamizhihoudemima){
                callback("CHENGGONG");
            }else{
                callback("MIMACUOWU");
            }
        }
    })
}

//静态方法，更改资料
userSchema.statics.changeprofile = function(yonghuming,obj,callback) {
    //先找到再改
    this.find({"yonghuming": yonghuming}, function (err, users) {
        //如果没有检索到
        if(users.length == 0){
            return;
        }
        var user = users[0];
        if(obj.nicheng){
            user.nicheng = obj.nicheng;
        }

        if(obj.jianjie){
            user.jianjie = obj.jianjie;
        }

        if(obj.avatar){
            user.avatar = obj.avatar;
        }

        user.save(callback);
    });
}

//定义模型
var User = mongoose.model("user",userSchema);

module.exports = User;

//
//User.regist("marong2","123123",function(result){
//    console.log(result);
//});