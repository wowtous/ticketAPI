var express = require('express');
var Order   = require('./../model/Order');
var Product = require('./../model/Product');
var CouponCode = require('./../model/CouponCode');
var Coupon = require('./../model/Coupon');
var Member  = require('./../model/Member');
var Machine = require('./../model/Machine');
var SubOrder = require('./../model/SubOrder');
var zlib        = require('zlib');
var async       = require('async');
var moment      = require('moment');
var PDFDocument = require('pdfkit');
var qrcode      = require('qrcode');
var crypto      = require('crypto');
var fs     = require('fs');
var router = express.Router();

var randomObjectId = function () {
    return crypto.createHash('md5').update(Math.random().toString()).digest('hex').substring(0, 24);
};

router.get('/ticket/print',function(req,res){
    res.render('ticketPrint',{});
});

router.get('/checkupdate',function(req,res){
    res.send("1");
});

router.get('/checkfile',function(req,res){
    fs.readFile('/home/ubuntu/test.gz',function(error,data){
        var md5sum = crypto.createHash('md5');
        md5sum.update(data);
        var md5String =  md5sum.digest('hex');
        res.set({
            "Content-Disposition": "attachment; filename="+md5String+".gz",
            "Content-Type": "application/text"
        });

        res.send(data);

    });
});

/* GET home page. */
router.post('/ticket/verify', function(request,response){
    var orderID    = request.body.orderID;
    var machineID  = request.body.machineID;
    var mobile     = request.body.mobile;
    var today      = new Date();
    var pngFileName =[];
    //var pngFileName  = './tmp/' + randomObjectId()+'.png'; //临时生成的png文件的名称
    today      = new Date(today.getYear()+1900,today.getMonth(),today.getDate()).getTime();
    var pdfFileName,couponCode,memberID,products,order_ID,activityType,orderInfo,QRUrl,ticketPDFBuf,couponCodeSize; //ticket1PDF 用来存储第一张ticket中的pdf的buffer数据
    QRUrl = 'http://www.baidu.com';
    couponCode=[];
    async.series([
        function(cb){
            //查询下单人的memberID
            Member.findOne({mobile:mobile}).exec(function(error,memberInfo){
                if(error){
                    cb('queryMemberError',null);
                }else if(memberInfo && memberInfo._id){
                    memberID = memberInfo._id;
                    cb(null,null);
                }else{
                    console.log('no such member,the mobile is:%s',mobile);
                    cb('noSuchMember',null);
                }
            });
        },
        function(cb){
            //查询机器编码对应的可打景区
            Machine.findOne({machineID:machineID}).exec(function(error,machine){
                if(error){
                    cb('queryMachineError',null);
                }else{
                    if(machine && machine.products){
                        products = JSON.parse(JSON.stringify(machine.products));
                        cb(null,null);
                    }else{
                        console.log('machine not configured,machine ID is:%s,machine result is %s',machineID,JSON.stringify(machine));
                        cb('machineNotConfig',null);
                    }
                }
            });
        },
        function(cb){
            //只选取已支付的  只能是当天的订单可以打印 手机号必须正确
            //Order.findOne({ orderID : orderID, member : memberID, status : 1, startDate : today })
            Order.findOne({ orderID : '102778' })
                .populate('product member coupon')
                .exec(function(error,order){
                    if(error){
                        cb('queryOrderError',null);
                    }else{
                        if(order){
                            //获取订单优惠券type
                            activityType = (order.coupon[0].type==0) ? 0:(order.coupon[0].type ? order.coupon[0].type : null);
                            couponCodeSize = (activityType===2) ? 2 : 1;

                            //再检查下这个订单能不能在这个景区打印
                            var isValidProduct = false;
                            //console.log(JSON.stringify(products));
                            for(var producti in products){
                                if( products[producti].toString() == order.product._id.toString()){
                                    isValidProduct = true;
                                }
                            }
                            //先检查一下这个订单有没有被打印过
                            if(order.isPrint==true){
                                //如果已经打印过了,就报错
                                cb('ticketPrinted',null);
                            }else if(!isValidProduct){
                                cb('notValidPlace',null);
                            }else{
                                order_ID  = order._id;
                                orderInfo = order;
                                cb(null,order_ID);
                            }
                        }else{
                            //如果找不到这个订单
                            cb('noSuchOrder',null);
                        }
                    }
                });
        },
        function(cb){
            //优惠券识别码
            var tasks = [];

            var getCouponTask = function(i){
                return function(cb){
                    CouponCode.findOneAndUpdate({isUsed:false,cat:"twoside"},{isUsed:true},function(error,couponData){
                        if(error){
                            cb('queryCouponCodeError,null');
                        }else if (couponData && couponData.code) {
                            couponCode[i] = couponData.code;
                            cb(null, couponCode);
                        } else {
                            console.log('couponCode not avilable,couponCode is %s', JSON.stringify(couponData));
                            cb('couponCodeNotExists', null);
                        }
                    });
                };
            }

            for(var i =0 ; i<couponCodeSize ; i++){
                tasks.push(getCouponTask(i));
            }

            async.series(tasks,function(error,result){
                if(error){
                    cb('GETCOUPONCODEERROR',result);
                }else{
                    cb(null,null);
                }

            });
        },
        function(cb){
            var tasks = [];

            var createQRCode = function(QRUrl,pngFileName){
                return function(cb){
                    //生成二维码
                    //console.log(pngFileName+'\n'+QRUrl);
                    qrcode.save(pngFileName, QRUrl,function(error,written){
                        if(error){
                            console.log('error:QR Code generate failed,QRUrl is %s',QRUrl);
                            cb('QRGenerateFailed',null);
                        }else{
                            console.log('%s,%s,%s QR image file : %s, size:%s',orderID,machineID,mobile,pngFileName,written);
                            cb(null,null);
                        }
                    });
                };
            };

            pdfFileName = './../tmp/'+ memberID;
            for(var i =0 ; i<couponCodeSize ; i++){
                pdfFileName += '_' + couponCode[i];
                pngFileName[i] = './../tmp/' + memberID+'_'+couponCode[i]+'_'+i+'.png'; //临时生成的png文件的名称
                QRUrl = 'http://dd885.com/ticketActivity?sourceMember='+memberID+'&couponCode='+couponCode[i];
                tasks.push(createQRCode(QRUrl,pngFileName[i]));
            }
            pdfFileName += '.pdf';
            async.series(tasks,function(error,result){
                cb(null,null);
            });
        },
        function(cb){
            //开始填写pdf1
            var doc = new PDFDocument();
            var fontFilePath = './../fonts/msyh.ttf';
            //console.log(JSON.stringify(orderInfo));
            ticketDrawing(doc,fontFilePath,pngFileName[0],'A',null);

            if(activityType == 2){
                doc.addPage();
                ticketDrawing(doc,fontFilePath,pngFileName[1],'B',null);
            }

            var pdf1stream = fs.createWriteStream(pdfFileName);
            doc.pipe(pdf1stream);
            doc.end();
            pdf1stream.on('finish',function(){
                cb(null,null);
            });
        },
        function(cb){
            //把上面生成的PDF1读出来
            fs.readFile(pdfFileName,function(error,data){
                if(error){
                    console.log('read PDF1 error,error is %s',error);
                    cb('readPDFError',null);
                }else{
                    ticketPDFBuf = data;
                    cb(null,null);
                }
            });
        }
    ],function(error,result){
        if(error == 'queryMemberError'){
            response.json({error:500,errorMsg:'会员查询出错'});
        }else if(error == 'noSuchMember'){
            response.json({error:404,errorMsg:'会员信息未找到'});
        }else if(error=='queryOrderError'){
            response.json({error:500,errorMsg:'订单查询出错'});
        }else if(error == 'noSuchOrder'){
            response.json({error:404,errorMsg:'订单信息未找到'});
        }else if(error == 'notValidPlace'){
            response.json({error:404,errorMsg:'此订单不能在此机器上打印'});
        }else if(error == 'ticketPrinted'){
            response.json({error:404,errorMsg:'此订单已经打印过'});
        }else if(error == 'queryMachineError'){
            response.json({error:500,errorMsg:'机器编号不正常'});
        }else if(error == 'QRGenerateFailed'){
            response.json({error:500,errorMsg:"二维码生成失败"});
        }else if(error == 'readPDFError'){
            response.json({error:500,errorMsg:"PDF生成失败"});
        }else if(error == 'machineNotConfig'){
            response.json({error:500,errorMsg:"机器暂未上线"});
        }else if(error == 'GETCOUPONCODEERROR'){
            response.json({error:500,errorMsg:"初始化优惠券识别码失败"});
        }else{
            response.json({error:0,errorMsg:"",buffer:ticketPDFBuf,order_ID:order_ID});
        }
    })
});

/**
 * 生成前端打印的pdf文件
 * @param doc           PDFDocument
 * @param fontFilePath  字体目录
 * @param mores         A B券
 */
function ticketDrawing(doc,fontFilePath,pngFileName,idCode,data){
    doc.rotate(180,{origin:[0,0]});
    var firstColumnY=-125;

    doc.font(fontFilePath).fontSize(8).text('玉龙雪山',-360,firstColumnY,{align:'left'});//产品名称
    //doc.font(fontFilePath).fontSize(8).text(moment(orderInfo.startDate).format("YYYY-MM-DD"),-360,-119,{align:'left'});//使用日期
    doc.font(fontFilePath).fontSize(8).text(('2015-03-05'),-360,firstColumnY+32,{align:'left'});//使用日期
    doc.font(fontFilePath).fontSize(8).text('门票',-360,firstColumnY+32*2,{align:'left'});//票类型
    doc.font(fontFilePath).fontSize(8).text(165,-360,firstColumnY+32*3-10,{align:'left'});//票价
    doc.font(fontFilePath).fontSize(8).text('2010',-35,firstColumnY+32*3,{align:'left'});//识别码
    doc.font(fontFilePath).fontSize(8).text('扫一扫 再送一张',-228,firstColumnY,{align:'left'});//二维码文字
    doc.font(fontFilePath).fontSize(24).text(idCode,-44,firstColumnY+10,{align:'left'});//识别码
    doc.image(pngFileName, -240, firstColumnY+10, {fit: [85,85]}); //二维码
};

module.exports = router;
