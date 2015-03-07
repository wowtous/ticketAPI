/**
 * Created by zzy on 3/7/14.
 */
var db = require('./../tools/db');
var Schema = db.mongoose.Schema;//Schema;
var subOrderSchema = new Schema({
    product: {'type':Schema.Types.ObjectId,'ref':'Product'},        //产品ID
    quantity: Number,                                               //产品数量
    price: {},                                                      //价格对象
    status: String                                                  //子订单状态 0 未支付 1 已支付 2 已确认 3 已取消（只能在未支付状态下跳转到已取消)
});

var SubOrder = db.mongoose.model("SubOrder", subOrderSchema);

module.exports = SubOrder;