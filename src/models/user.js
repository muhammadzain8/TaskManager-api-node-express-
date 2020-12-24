const mongoose=require('mongoose');
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken');
const Task=require('./task')


const userschema=new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim:true
    },
    age:{
        type: Number,
        default:18,
        validate(value){
            if(value<=0){
                throw new Error(' Age must be positive number ')
            }
        }
    },
    email:{
        type: String,
        required:true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('  Email is invalid  ')
            }
        }
    },
    password:{
        type: String,
        unique: true,
        required:true,
        minlength:[6,'length must be greater than 6 '],
        trim:true,
        validate(pass){
            if(pass.toLowerCase().includes("password") || pass.toLowerCase().includes(this.name)){
                throw new Error('password not valid')
            }
        }
    },
    tokens:[{
        token:{
            type:"string",
            required:true
        }
    }],
    image:{
        type:Buffer
    }
},{
    timestamps:true          // this is default false 
})

userschema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'author'
})

userschema.methods.toJSON=function(){
    const user=this
    const userObj=user.toObject()//     give raw profile data only

    delete userObj.password
    delete userObj.tokens
    delete userObj.image
    return userObj
}

//  generate token 
userschema.methods.generateToken =async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString(),},process.env.JWT_SECRET)
    user.tokens=user.tokens.concat({token})
    await user.save()    
    return token
}

// find credentials for user for login
userschema.statics.findByCredentials=async (email, password)=>{
    const user=await User.findOne({email})
    if(!user){
        throw new Error(' Unable to Login! ')
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error(' Unnable to Login ')
    }
    return user 
}


// pre-middleware  for hashing password 
userschema.pre('save',async function(next){
    const user=this
    if(user.isModified('password')){
        user.password= await bcrypt.hash(user.password,10)
    }
    next()
})

// delete user tasks when user deleted
userschema.pre('remove',async function(next){
    const  user=this
    await Task.deleteMany({author:user._id})
    next()
})

const User=mongoose.model('User',userschema)
module.exports=User


