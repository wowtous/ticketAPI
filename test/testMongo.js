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

Order.findOne({ orderID : "107331", status : 2})
    .populate('product member coupon')
    .exec(function (error, orderInfo) {
        if (error) {
        } else if (orderInfo && orderInfo.product) {
            console.log(orderInfo.product.name);
        } else {
        }
    });
/*
Member.findOne({_id : "5365d83f0cae76019c9b8ca7",mobile: eval("/\\d{7}5242/")}).exec(function (error, memberInfo) {
    if (error) {
        cb('queryMemberError', null);
    } else if (memberInfo && memberInfo._id) {
        console.log(memberInfo._id);
    } else {
        //console.log('no such member,the mobile is:%s', mobile);
    }
});

Machine.findOne({machineID:"228"}).exec(function(error,machine){
    var products;
    if(error){
        cb('queryMachineError',null);
    }else{
        if(machine && machine.products){
            products = JSON.parse(JSON.stringify(machine.products));
            console.log(products);
        }else{
            console.log('machine not configured,machine ID is:%s,machine result is %s',machineID,JSON.stringify(machine));
        }
    }
});
*/

/*
qrcode.save("./tmp/test.png", 'http://dd885.com/ticketActivity?sourceMember=53840b4e8cd2f52e1bc65571&couponCode=eaiC5',function(error,written){
    if(error){
        console.log('error:QR Code generate failed,QRUrl is');
    }else{
        console.log('isOk');
    }
});*/

//console.log(moment(1426348800000).format("YYYY-MM-DD"));

/*var printData = {
    'productName'   : '玉龙雪山',
    'useDate'       : '2015-03-15',
    'ticketType'    : '门票',
    'ticketPrice'   : 100,
    'orderCode'     : '2015',
    'qrWords'       : '扫一扫 再送一张',
    'orderID'       : '102278'
};

var doc = new PDFDocument();
var fontFilePath = './../fonts/msyh.ttf';
var pdfFileName = '/home/wucho/ticket.pdf';

ticketDrawing(doc, fontFilePath, "./../tmp/53840b4e8cd2f52e1bc65571_Bopaa_0.png", 'A', printData);

var pdf1stream = fs.createWriteStream(pdfFileName);
doc.pipe(pdf1stream);
doc.end();

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
};*/


Order.findOne({ orderID : "102778"})  // 测试
    .populate('product member coupon')
    .exec(function (error, order) {
        if (error) {
            if(debug){ console.log('queryOrderError 602,the orderID is:%s', orderID); }
            cb('queryOrderError', null);
        } else {
            if (order) {
                // step2 再检查下这个订单能不能在这个景区打印
                var isValidProduct = false;
                //console.log(JSON.stringify(products));
                for (var producti in products) {
                    if (products[producti].toString() == order.product._id.toString()) {
                        isValidProduct = true;
                    }
                }

                // step3 判断会员MOBILE后4位是否匹配
                var isValidMember = false;
                var memberMobile = order.member.mobile;
                if(order.member && memberMobile.substring(memberMobile.length-4,memberMobile.length)===mobile){
                    isValidMember = true;
                    // step4 获取订单优惠券类型 (type==2) 打印2张 否则1张
                    console.log(order.coupon[0]);
                    if(order.coupon && order.coupon[0] && order.coupon[0].type===2){
                        couponCodeSize = 2;
                    } else{
                        couponCodeSize = 1;
                    }
                }

                // step5 判断订单是否可打印
                if (order.isPrint) {
                    cb('ticketPrinted', null); // 先检查一下这个订单有没有被打印过,如果已经打印过了,就报错
                } else if (!isValidProduct) {
                    cb('notValidPlace', null);
                } else if (!isValidMember) {
                    cb('queryOrderMemberError', null);
                } else {
                    // 生成打印信息
                    printData.orderID = order.orderID;
                    printData.useDate = moment(order.startDate).format("YYYY-MM-DD");
                    printData.ticketPrice = order.totalPrice/(order.quantity ? order.quantity : 1);
                    printData.productName = order.product.name;
                    order_ID = order._id;
                    orderInfo = order;
                    cb(null, null);
                }
            } else {
                if(debug){ console.log('noSuchOrder 603,the orderID is:%s', orderID); }
                cb('noSuchOrder', null); // 如果找不到这个订单
            }
        }
    });