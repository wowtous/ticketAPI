/**
 * Created by zzy on 3/3/14.
 */

var mongoose = require('mongoose');


var MONGOSERVER1=process.env.MONGOSERVER1||"localhost";
var MONGOSERVER2=process.env.MONGOSERVER2||"localhost";
var MONGOSERVER3=process.env.MONGOSERVER3||"localhost";

var options = {
//    replset: { rs_name: 'replidb' }
}

var uri = "mongodb://"+MONGOSERVER1+"/zjy,"+
          "mongodb://"+MONGOSERVER2+"/zjy,"+
          "mongodb://"+MONGOSERVER3+"/zjy";
mongoose.connect(uri, options);


//mongoose.connect('mongodb://172.16.0.15/zjy');
exports.mongoose = mongoose;