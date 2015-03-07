/**
 * Created by wucho on 4/30/14.
 */
var db = require('./../tools/db');
var Schema = db.mongoose.Schema;//Schema;

var couponCodeSchema = new Schema({
    'code'  : String,           //优惠券编码
    'cat'   : String,
    'isUsed': {type:'Boolean',default:false}               //是否有效
});

var CouponCode = db.mongoose.model("CouponCode", couponCodeSchema);

module.exports = CouponCode;

/**
var a='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var b=[];

for(var i=0;i<10000;i++){
    var t={};
    t.code='';
    t.cat='twoside';
    t.isUsed=false;

    for(var j=0;j<5;j++){
        t.code+=a[Math.floor(Math.random()*62)];
    }
    b.push(t);
}
db.couponcodes.save(b)
*/
