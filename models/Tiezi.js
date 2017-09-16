var mongoose = require("mongoose");
//mongoose.connect("mongodb://localhost/shuoshuo");
var mongodb = require("mongodb");
var ObjectId = mongodb.ObjectId;

//定义schema
var tieziSchema = mongoose.Schema({
    "yonghuming" :  String,
    "content"   :   String,
    "time"      :   Date,
    "pinglun"   :   [Object]
});

//静态方法，发表
tieziSchema.statics.fabiao = function(yonghuming,content,callback){
    var t = new Tiezi({
        "yonghuming" : yonghuming,
        "content" : content,
        "time" : new Date(),
        "pinglun" : []
    });

    t.save(callback);
}

//静态方法，列出所有帖子
tieziSchema.statics.liechusuoyoutiezi = function(callback){
    this.find({},callback);
}

//静态方法，评论
tieziSchema.statics.pinglun = function(pinglunren,pingluncontent,callback){
    this.pinglun.push(
        {
            "pinglunren" : pinglunren,
            "pingluncontent" : pingluncontent
        }
    )

    this.save(callback);
}

//静态方法，列出某个人的帖子
tieziSchema.statics.liechumougerendetiezi = function(yonghuming,callback){
    this.find({"yonghuming" : yonghuming},callback);
}

//静态方法，通过_id来得到帖子
tieziSchema.statics.getTiezibyidstring = function(idstring , callback){
    console.log(idstring);
    if(typeof idstring != "string" || idstring.length != 24){
        callback("WRONG",null);
        return;
    }

    if(!/^[0-9a-fA-F]{24}$/.test(idstring)){
        callback("WRONG",null);
        return;
    }

    this.find({"_id" : ObjectId(idstring)},callback);
}


//定义模型，自动创建tiezis
var Tiezi = mongoose.model("tiezi",tieziSchema);



module.exports = Tiezi;
