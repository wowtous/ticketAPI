var express = require('express');
var Order = require('./../model/Order');
var Product = require('./../model/Product');
var CouponCode = require('./../model/CouponCode');
var Coupon = require('./../model/Coupon');
var Member = require('./../model/Member');
var Machine = require('./../model/Machine');
var SubOrder = require('./../model/SubOrder');
var zlib = require('zlib');
var async = require('async');
var moment = require('moment');
var PDFDocument = require('pdfkit');
var qrcode = require('qrcode');
var crypto = require('crypto');
var fs = require('fs');
var router = express.Router();
var debug = true;
var fontFilePath = 'fonts/msyh.ttf';
var checkupdateFile = '/home/ubuntu/printDriver.tar.gz';

var randomObjectId = function () {
    return crypto.createHash('md5').update(Math.random().toString()).digest('hex').substring(0, 24);
};

router.get('/ticket/print', function (req, res) {
    res.render('ticketPrint', {
         'title' : "wcy"
        ,'attention' : "关注万车游微信免费领门票"
        ,'service' : "客服电话：400-885-3885"
    });
});

router.get('/checkupdate', function (req, res) {
    res.send("1");
});

router.get('/checkmd5', function (req, res) {
    fs.readFile(checkupdateFile, function (error, data) {
        var md5sum = crypto.createHash('md5');
        md5sum.update(data);
        var md5String = md5sum.digest('hex');
        res.send(md5String);
    });
});

router.get('/checkfile', function (req, res) {
    fs.readFile(checkupdateFile, function (error, data) {
        var md5sum = crypto.createHash('md5');
        md5sum.update(data);
        var md5String = md5sum.digest('hex');
        res.set({
            "Content-Disposition": "attachment; filename=" + md5String + ".tar.gz",
            "Content-Type": "application/text"
        });
        res.send(data);
    });
});

/* GET home page. */
router.post('/ticket/verify', function (request, response) {
    var orderID = request.body.orderID;
    var machineID = request.body.machineID;
    var mobile = request.body.mobile;
    var today = new Date();
    var pngFileName = [];
    var printData = {
        'productName'   : '玉龙雪山',
        'useDate'       : '2015-03-15',
        'ticketType'    : '门票',
        'ticketPrice'   : 100,
        'orderCode'     : '2015',
        'qrWords'       : '扫一扫 再送一张',
        'orderID'       : ''
    };
    //var pngFileName  = './tmp/' + randomObjectId()+'.png'; //临时生成的png文件的名称
    today = new Date(today.getYear() + 1900, today.getMonth(), today.getDate()).getTime();
    var pdfFileName, couponCode, memberID, products, order_ID, activityType, orderInfo, QRUrl, ticketPDFBuf, couponCodeSize; //ticket1PDF 用来存储第一张ticket中的pdf的buffer数据
    QRUrl = 'http://www.baidu.com';
    couponCode = [];
    async.series([
        /*function (cb) {
            //只选取已确认的  只能是当天的订单对应的member
            // TODO 已确认的订单号是否唯一
            //Order.findOne({ orderID : orderID, status : 2, startDate : today },{ "member" : true })
            Order.findOne({ orderID : orderID, status : 3 },{ "member" : true })
                .exec(function (error, memberInfo) {
                if (error) {
                    if(debug){
                        console.log('queryOrderMemberError 614,the orderID is:%s', orderID);
                    }
                    cb('queryOrderMemberError', null);   // 会员查询出错
                } else if (memberInfo && memberInfo.member) {
                    memberID = memberInfo.member;
                    cb(null, null);
                } else {
                    if(debug){
                        console.log('noSuchOrderMember 615,the orderID is:%s', orderID);
                    }
                    cb('noSuchOrderMember', null);       // 会员信息未找到
                }
            });
        },
        function (cb) {
            //查询下单人的memberID
            Member.findOne({_id : memberID,mobile: eval("/\\d{7}"+mobile+"/")}).exec(function (error, memberInfo) {
                if (error) {
                    if(debug){
                        console.log('queryMemberError 600,the memberID is:%s', memberID);
                    }
                    cb('queryMemberError', null);   // 会员查询出错
                } else if (memberInfo && memberInfo._id) {
                    memberID = memberInfo._id;
                    cb(null, null);
                } else {
                    if(debug){
                        console.log('noSuchMember 601,the mobile is:%s', mobile);
                    }
                    cb('noSuchMember', null);       // 会员信息未找到
                }
            });
        },*/
        function (cb) {
            //查询机器编码对应的可打景区
            Machine.findOne({machineID: machineID}).exec(function (error, machine) {
                if (error) {
                    if(debug){
                        console.log('queryMachineError 606,the mobile is:%s', mobile);
                    }
                    cb('queryMachineError', null);      // 机器编号不正常
                } else {
                    if (machine && machine.products) {
                        products = JSON.parse(JSON.stringify(machine.products));
                        cb(null, null);
                    } else {
                        if(debug){
                            console.log('machineNotConfig 609,machine not configured,machine ID is:%s,machine result is %s', machineID, JSON.stringify(machine));
                        }
                        cb('machineNotConfig', null);   // 会员信息未找到
                    }
                }
            });
        },
        function (cb) {
            //只选取已确认的  只能是当天的订单可以打印 手机号必须正确
            // TODO 是否更新订单打印状态
            //Order.findOne({ orderID : orderID, member : memberID, status : 2, startDate : today })
            Order.findOne({ orderID : orderID, member : memberID})
            .populate('product member coupon')
            .exec(function (error, order) {
                if (error) {
                    if(debug){
                        console.log('queryOrderError 602,the orderID is:%s', orderID);
                    }
                    cb('queryOrderError', null);
                } else {
                    if (order) {
                        //生成打印信息
                        printData.orderID = order.orderID;
                        printData.useDate = moment(order.startDate).format("YYYY-MM-DD");
                        printData.ticketPrice = order.totalPrice/(order.quantity ? order.quantity : 1);
                        printData.productName = order.product.name;

                        var memberMobile = order.member.mobile;

                        // 判断会员MOBILE是否合法
                        if(order.member && memberMobile.substring(memberMobile.length-4,memberMobile.length)===mobile){
                            //获取订单优惠券type
                            if(order.coupon && order.coupon[0] && order.coupon[0].type===2){
                                couponCodeSize = 2;
                            } else{
                                couponCodeSize = 1;
                            }

                            //再检查下这个订单能不能在这个景区打印
                            var isValidProduct = false;
                            //console.log(JSON.stringify(products));
                            for (var producti in products) {
                                if (products[producti].toString() == order.product._id.toString()) {
                                    isValidProduct = true;
                                }
                            }
                            //先检查一下这个订单有没有被打印过
                            if (order.isPrint == true) {
                                //如果已经打印过了,就报错
                                cb('ticketPrinted', null);
                            } else if (!isValidProduct) {
                                cb('notValidPlace', null);
                            } else {
                                order_ID = order._id;
                                orderInfo = order;
                                cb(null, null);
                            }
                        } else{
                            cb('queryMemberError', null);   // 会员查询出错
                        }
                    } else {
                        //如果找不到这个订单
                        if(debug){
                            console.log('noSuchOrder 603,the orderID is:%s', orderID);
                        }
                        cb('noSuchOrder', null);
                    }
                }
            });
        },
        function (cb) {
            //优惠券识别码
            var tasks = [];

            var getCouponTask = function (i) {
                return function (cb) {
                    CouponCode.findOneAndUpdate({
                        isUsed: false,
                        cat: "twoside"
                    }, {isUsed: true}, function (error, couponData) {
                        if (error) {
                            if(debug){
                                console.log('queryCouponCodeError 611,error is %s', error);
                            }
                            cb('queryCouponCodeError',null);
                        } else if (couponData && couponData.code) {
                            couponCode[i] = couponData.code;
                            cb(null, couponCode);
                        } else {
                            if(debug){
                                console.log('couponCodeNotExists 612');
                            }
                            cb('couponCodeNotExists', null);
                        }
                    });
                };
            }

            for (var i = 0; i < couponCodeSize; i++) {
                tasks.push(getCouponTask(i));
            }

            async.series(tasks, function (error, result) {
                if (error) {
                    if(debug){
                        console.log('GETCOUPONCODEERROR 610');
                    }
                    cb('GETCOUPONCODEERROR', result);
                } else {
                    cb(null, null);
                }

            });
        },
        function (cb) {
            var tasks = [];

            var createQRCode = function (QRUrl, pngFileName) {
                return function (cb) {
                    //生成二维码
                    //console.log(pngFileName+'\n'+QRUrl);
                    qrcode.save(pngFileName, QRUrl, function (error, written) {
                        if (error) {
                            if(debug){
                                console.log('QRGenerateFailed 607,error:QR Code generate failed,QRUrl is %s', QRUrl);
                            }
                            cb('QRGenerateFailed', null);
                        } else {
                            //console.log('%s,%s,%s QR image file : %s, size:%s', orderID, machineID, mobile, pngFileName, written);
                            cb(null, null);
                        }
                    });
                };
            };

            pdfFileName = 'tmp/' + memberID;
            for (var i = 0; i < couponCodeSize; i++) {
                pdfFileName += '_' + couponCode[i];
                pngFileName[i] = 'tmp/' + memberID + '_' + couponCode[i] + '_' + i + '.png'; //临时生成的png文件的名称
                QRUrl = 'http://dd885.com/ticketActivity?sourceMember=' + memberID + '&couponCode=' + couponCode[i];
                tasks.push(createQRCode(QRUrl, pngFileName[i]));
            }
            pdfFileName += '.pdf';
            async.series(tasks, function (error, result) {
                cb(null, null);
            });
        },
        function (cb) {
            //开始填写pdf1
            var doc = new PDFDocument();
            ticketDrawing(doc, fontFilePath, pngFileName[0], 'A', printData);

            if (activityType == 2) {
                doc.addPage();
                ticketDrawing(doc, fontFilePath, pngFileName[1], 'B', printData);
            }

            var pdf1stream = fs.createWriteStream(pdfFileName);
            doc.pipe(pdf1stream);
            doc.end();
            pdf1stream.on('finish', function (error,result) {
                if (error) {
                    if(debug){
                        console.log('pdfGenerateFailed 613');
                    }
                    cb('pdfGenerateFailed', null);
                } else {
                    cb(null, null);
                }
            });
        },
        function (cb) {
            //把上面生成的PDF1读出来
            fs.readFile(pdfFileName, function (error, data) {
                if (error) {
                    if(debug){
                        console.log('readPDFError 608,error is %s', error);
                    }
                    cb('readPDFError', null);
                } else {
                    ticketPDFBuf = data;
                    cb(null, null);
                }
            });
        }
    ], function (error, result) {
        if (error == 'queryMemberError') {
            response.json({error: 600, errorMsg: '会员查询出错'});
        } else if (error == 'noSuchMember') {
            response.json({error: 601, errorMsg: '会员信息未找到'});
        } else if (error == 'queryOrderError') {
            response.json({error: 602, errorMsg: '订单查询出错'});
        } else if (error == 'noSuchOrder') {
            response.json({error: 603, errorMsg: '订单信息未找到'});
        } else if (error == 'notValidPlace') {
            response.json({error: 604, errorMsg: '此订单不能在此机器上打印'});
        } else if (error == 'ticketPrinted') {
            response.json({error: 605, errorMsg: '此订单已经打印过'});
        } else if (error == 'queryMachineError') {
            response.json({error: 606, errorMsg: '机器编号不正常'});
        } else if (error == 'QRGenerateFailed') {
            response.json({error: 607, errorMsg: "二维码生成失败"});
        } else if (error == 'readPDFError') {
            response.json({error: 608, errorMsg: "PDF生成失败"});
        } else if (error == 'machineNotConfig') {
            response.json({error: 609, errorMsg: "机器暂未上线"});
        } else if (error == 'GETCOUPONCODEERROR') {
            response.json({error: 610, errorMsg: "初始化优惠券识别码失败"});
        } else if(error == 'queryCouponCodeError'){
            response.json({error: 611, errorMsg: "优惠券识别码查询失败"});
        } else if(error == 'couponCodeNotExists'){
            response.json({error: 612, errorMsg: "优惠券识别码已用完"});
        } else if(error == 'pdfGenerateFailed'){
            response.json({error: 613, errorMsg: "门票生成失败"});
        } else if(error == 'queryOrderMemberError'){
            response.json({error: 614, errorMsg: "查询会员订单失败"});
        } else if(error == 'noSuchOrderMember'){
            response.json({error: 615, errorMsg: "查无匹配可确认单"});
        } else {
            response.json({error: 0, errorMsg: "", buffer: ticketPDFBuf, order_ID: order_ID});
        }
    })
});

/**
 * 生成前端打印的pdf文件
 * @param doc           PDFDocument
 * @param fontFilePath  字体目录
 * @param mores         A B券
 */
function ticketDrawing(doc, fontFilePath, pngFileName, idCode, data) {
    doc.rotate(180, {origin: [0, 0]});
    var firstColumnY = -95;
    var firstColumnX = -360;

    doc.font(fontFilePath).fontSize(8).text(data.productName, firstColumnX, firstColumnY, {align: 'left'});//产品名称
    //doc.font(fontFilePath).fontSize(8).text(moment(orderInfo.startDate).format("YYYY-MM-DD"),-360,-119,{align:'left'});//使用日期
    doc.font(fontFilePath).fontSize(8).text((data.useDate), firstColumnX, firstColumnY + 32, {align: 'left'});//使用日期
    doc.font(fontFilePath).fontSize(8).text(data.ticketType, firstColumnX, firstColumnY + 62, {align: 'left'});//票类型
    doc.font(fontFilePath).fontSize(8).text(data.ticketPrice, firstColumnX, firstColumnY + 94, {align: 'left'});//票价
    doc.font(fontFilePath).fontSize(8).text(data.orderCode, firstColumnX+325, firstColumnY + 94, {align: 'left'});//识别码
    doc.font(fontFilePath).fontSize(8).text(data.qrWords, firstColumnX+132, firstColumnY+12, {align: 'left'});//二维码文字
    doc.font(fontFilePath).fontSize(24).text(idCode, firstColumnX+314, firstColumnY + 50, {align: 'left'});//识别码
    doc.font(fontFilePath).fontSize(8).text(data.orderID, firstColumnX+292, firstColumnY + 130, {align: 'left'});//orderID
    doc.image(pngFileName, firstColumnX+120, firstColumnY + 22, {fit: [85, 85]}); //二维码
};

module.exports = router;
