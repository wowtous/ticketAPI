/**
 * Created by zzy on 3/7/14.
 */
var db = require('./../tools/db');
var Schema = db.mongoose.Schema;//Schema;
var _ = require('underscore');
var productSchema = new Schema({
    relatedProductID: [                                                 //关联产品
        {
            'product': {'type':Schema.Types.ObjectId,'ref':'Product'},  //关联产品ID
            'day': Number,                                              //第几天
            'qty': Number                                               //数量
        }
    ],
    name: {type: 'String', unique: true},                               //产品名称
    content: String,                                                    //产品内容
    intro: String,                                                      //产品简介
    image: [                                                            //产品图片
        {
            url    : String,                                            //产品图片地址
            intro  : String,                                            //产品图片简介
            width  : Number,                                            //图片宽度
            height : Number,                                            //图片高度
            title  : String                                             //图片简介
        }
    ],
    city: {'type':Schema.Types.ObjectId,'ref':'City'},                  //产品所在城市ID
    addr: String,                                                       //产品地址（文字)
    gps: {                                                              //产品地址(经纬度)
        lat: Number,                                                    //产品地址维度
        lon: Number                                                     //产品地址经度
    },
    level: Number,                                                      //产品级别
    openTime: String,                                                   //产品使用时间
    bookRule: String,                                                   //预定须知
    useRule: String,                                                    //使用须知
    cancelRule: String,                                                 //退改规则
    transportation: String,                                             //交通指南
    effectDate: Number,                                                 //有效期开始
    expiryDate: Number,                                                 //有效期结束
    isEnable: Boolean,                                                  //产品状态
    contactName: String,                                                //产品联系人
    tel: String,                                                        //产品联系电话
    fax: String,                                                        //产品联系传真
    type: Number,                                                       //产品大类 ticket:1,hotel:2,voture:3,package:4,ticketPackage:5
    subType: Number,                                                    //产品子类 PACKAGE 1 电子票 2 实体票
    status: {'type': Number, 'default': 1},                             //产品状态
    operator: {'type':Schema.Types.ObjectId,'ref':'Member'},            //操作员
    createTime: {type: Number, default: Date.now},                      //产品创建时间
    updateTime: Number,                                                 //产品修改时间
    isHot:Boolean,                                                      //热门推荐
    buy1Free1:Boolean                                                   //是否参加买一送一
},{
    toObject: { "virtuals": true },
    toJSON: { "virtuals": true }
});

productSchema.virtual('typeName').get(function () {
    var typeName = '';
    switch (parseInt(this.type)){
        case 1:typeName='门票';break;
        case 2:typeName='酒店';break;
        case 3:typeName='餐券';break;
        case 4:typeName='套餐';break;
        case 5:typeName='套票';break;
        default: typeName='';
    }
    return typeName;
});


productSchema.virtual('levelName').get(function () {
    var levelName = '';
    if(!this.level) return "";
    if(this.type==1){ //门票
        switch(parseInt(this.level)){
            case 1:levelName='A级景区';break;
            case 2:levelName='AA级景区';break;
            case 3:levelName='AAA级景区';break;
            case 4:levelName='AAAAA级景区';break;
            case 5:levelName='AAAAAA级景区';break;
            case 6:levelName='国家级景区';break;
            default: levelName="";
        }
    }else if(this.type==2){ //酒店
        levelName=this.level.toString()+'星级';
    }else if(this.type==3){//餐券
        levelName=this.level.toString()+'星推荐';
    }else if(this.type == 4){//套餐
        levelName="";
    }else if(this.type==5){//套票
        levelName="";
    }else{
        levelName="";
    }
    return levelName;
});

productSchema.virtual('images').get(function () {
    var images = [];
    if(_.isEmpty(this.image)){
        //如果产品本身没有图片,这种情况一般是打包产品,这个时候要把打包产品的图片集成到一起
        if(_.isArray(this.relatedProductID)){
            this.relatedProductID.forEach(function(rp){
                images = images.concat(rp.product.image);
            });
        }
    }else{
        //如果产品本身就有图片了，就沿用产品本身的图片
        images = this.image;
    }
    return images;
});

//取一个图片信息，用户产品列表页啊，订单详情页这种
productSchema.virtual('imageOne').get(function () {
    var image = {};
    if(_.isEmpty(this.image)){
        //如果产品本身没有图片，则看看子产品中是否有酒店的照片，如果有酒店的照片
        //则用酒店产品的第一张照片，否则用第一个关联产品的第一张照片
        if(_.isArray(this.relatedProductID) && this.relatedProductID.length!=0 && this.relatedProductID[0]["product"] && this.relatedProductID[0]["product"]["image"] && this.relatedProductID[0]["product"]["image"].length!=0){
            image = this.relatedProductID[0]["product"]["image"][0];
            this.relatedProductID.forEach(function(rp){
                if(rp.product.type == 2){
                    //如果有酒店，则用酒店的第一张图片
                    image = rp.product.image[0];
                }
            });
        }
    }else{
        //如果产品本身有图片,则用产品本身的第一张图片
        image = this.image[0];
    }
    return image;
});

var Product = db.mongoose.model("Product", productSchema);

module.exports = Product;
