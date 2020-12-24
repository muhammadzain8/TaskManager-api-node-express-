const mongoose=require('mongoose');
const validator=require('validator')

const taskschema=new mongoose.Schema({
    description:{
        type: String,
        required:true,
        trim:true,
    },
    completed:{
        type: Boolean,
        default:false
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'      // model name for reference
    }
},{
    timestamps:true
})

const Task=mongoose.model('Task',taskschema)
module.exports=Task