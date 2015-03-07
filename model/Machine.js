var db = require('./../tools/db');
var Schema = db.mongoose.Schema;//Schema;
var machineSchema = new Schema({
    machineID : String,                                            //机器编号
    products  : [{'type':Schema.Types.ObjectId,'ref':'Product'} ]     //产品ID
},{
    toObject: { "virtuals": true },
    toJSON: { "virtuals": true }
});

var Machine = db.mongoose.model("Machine", machineSchema);

module.exports = Machine;