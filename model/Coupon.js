/**
 * Created by zzy on 5/19/14.
 */
var db = require('./../tools/db');
var Schema = db.mongoose.Schema;//Schema;

var couponSchema = new Schema({
    'code':String,                                              //券号
    'minValue':{'type':Number,'default':0},                     //最小订单金额
    'type':Number,                                              //类型 0：金额券 1：折扣券 3：产品固定价格 4：免费券 2:买一送一券
    'value':Number,                                             //类型的值
    'name':String,                                              //名称
    'product':[{'type':Schema.Types.ObjectId,'ref':'Product'}], //对应产品
    'expiryDate':Number,                                        //有效期
    'effectDate':Number,                                        //有效期
    'status':Number,                                            //状态 1：已使用 0：未使用
    'member':{'type':Schema.Types.ObjectId,'ref':'Member'},     //分配到的用户
    'orderID':String,                                           //订单号
    'source':String,                                            //渠道来源
    'createTime':Number                                         //优惠券创建时间
});

couponSchema.virtual('typeName').get(function () {
    var typeName="";
    switch (parseInt(this.type)){
        case 0:typeName = "金额券";break;
        case 1:typeName = "折扣券";break;
        case 2:typeName = "买一送一券";break;
        case 3:typeName = "固定价格";break;
        case 4:typeName = "免费券";break;
        default:typeName = "类型有误";
    };
    return typeName;
});

//订单状态名称的虚拟字段
couponSchema.virtual('statusName').get(function () {
    var statusName="";
    switch (parseInt(this.status)){
        case 0:statusName = "未使用";break;
        case 1:statusName = "已使用";break;
        default:statusName = "状态有误";
    };
    return statusName;
});



var Coupon = db.mongoose.model("Coupon", couponSchema);

module.exports = Coupon;