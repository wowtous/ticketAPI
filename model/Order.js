/**
 * Created by zzy on 3/7/14.
 */
var db = require('./../tools/db');
var Schema = db.mongoose.Schema;//Schema;
var orderSchema = new Schema({
    orderID: String,                                            //订单号
    member: {'type':Schema.Types.ObjectId,'ref':'Member'},      //会员编号
    orderDate: Number,                                          //下单日期
    startDate: Number,                                          //出发日期
    endDate: Number,                                            //结束日期
    source: {'type':Schema.Types.ObjectId,'ref':'Source'},      //订单来源
    payWay: String,                                             //付款方式  10.web支付宝  20.wap支付宝 30.微支付
    quantity: Number,                                           //产品数量
    remark: String,                                             //订单备注
    product: {'type':Schema.Types.ObjectId,'ref':'Product'},    //产品ID
    totalPrice: Number,                                         //产品总金额
    subOrder: [{'type':Schema.Types.ObjectId,'ref':'SubOrder'}],//子订单
    liveName:String,                                            //联系人
    contactPhone:String,                                        //联系电话
    isWeekend:Boolean,                                          //周末
    status:{'type':Number,'default':0},                         //状态 0 未支付 1 已支付 2 已确认 3 已取消（只能在未支付状态下跳转到已取消) 4 已退款 5 退款中
    invoice:{'types':String,'title':String,'address':String,'status':Number,'num':String}, //发票 类型(p 个人 e 公司)  抬头 邮寄地址 发票状态 (0 未开 1 已开 2 作废 ) 发票号
    opRemark:String,                                             //操作员备注
    transID:String,
    payDate:Number,
    coupon:[{'type':Schema.Types.ObjectId,'ref':'Coupon'}],
    payValue:Number,                                                   //实际支付金额
    image: [                                                            //产品图片
        {
            url: String,                                                //订单附件图片地址
            intro: String                                               //订单附件图片描述
        }
    ],
    isPrint : Boolean,
    productImage: String //产品中的图片
},{
    toObject: { "virtuals": true },
    toJSON: { "virtuals": true }
});
//订单状态名称的虚拟字段
orderSchema.virtual('statusName').get(function () {
    var statusName="";
    switch (this.status){
        case 0:statusName = "未支付";break;
        case 1:statusName = "已支付";break;
        case 2:statusName = "已确认";break;
        case 3:statusName = "已取消";break;
        case 4:statusName = "已退款";break;
        case 5:statusName = "退款中";break;
        default:statusName = "状态有误";
    };
    return statusName;
});

//支付方式的虚拟名称
orderSchema.virtual('payWayName').get(function () {
    var payWayName="";
    switch (this.status){
        case 10:payWayName = "web支付宝";break;
        case 20:payWayName = "wap支付宝";break;
        case 30:payWayName = "wap微支付";break;
        default:payWayName = "";
    };
    return payWayName;
});

//发票类型的虚拟名称
orderSchema.virtual('invoice.typeName').get(function () {
    var typeName="";
    switch (this.invoice.types){
        case "p":typeName = "个人";break;
        case "e":typeName = "公司";break;
        default:typeName = "";
    };
    return typeName;
});

var Order = db.mongoose.model("Order", orderSchema);

module.exports = Order;