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

/*Member.findOne({mobile:'13916999094'}).exec(function(error,memberInfo){
    if(error){
    }else if(memberInfo && memberInfo._id){
        memberID = memberInfo._id;
        console.log(memberInfo);
    }else{
        console.log('no such member,the mobile is:%s',mobile);
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

qrcode.save("./tmp/test.png", 'http://dd885.com/ticketActivity?sourceMember=53840b4e8cd2f52e1bc65571&couponCode=eaiC5',function(error,written){
    if(error){
        console.log('error:QR Code generate failed,QRUrl is');
    }else{
        console.log('isOk');
    }
});