/**
 * Created by zzy on 3/3/14.
 */
var db = require('./../tools/db');
var Schema = db.mongoose.Schema;//Schema;
var memberSchema = new Schema({
    mobile: {type: 'String', unique: true},                     //会员手机号
    name: String,                                               //会员姓名
    passwd: String,                                             //会员登录密码
    email: String,                                              //会员邮箱
    tel:String,                                                 //会员电话 仅供应商分销商使用
    gender: String,                                             //会员性别
    birthYear:String,                                           //出生年份 仅会员
    favouriteCity:String,                                       //最近喜爱的目的地 仅会员
    lastDestCity:String,                                        //最近一次出游的城市 仅会员
    lisencePlate:String,                                        //车牌号 仅会员
    accompany:String,                                           //同行人
    intentCity:String,                                          //希望再次出游的城市 仅会员
    idCard: String,                                             //会员身份证
    postAddr: String,                                           //会员家庭住址 仅会员
    signUpDate: { type: Number, default: Date.now },            //会员注册时间
    provider: {type:Schema.Types.ObjectId,ref:'Ent'},           //供应商ID
    operator: {type:Schema.Types.ObjectId,ref:'Member'},        //操作员
    isEnable: Boolean,                                          //会员状态
    source:{type:Schema.Types.ObjectId,ref:'Source'},           //来源
    openID:String
});

var Member = db.mongoose.model("Member", memberSchema);

module.exports = Member;