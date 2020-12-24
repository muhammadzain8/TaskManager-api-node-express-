const express =require('express')
const router=new express.Router()
const User = require('../models/user')
const auth=require('../middlewares/auth')
const multer=require('multer')
const { get } = require('mongoose')
const sharp=require('sharp')
const {sendmail,sendmail_for_response}=require('../emails/account')

//   register user 
router.post('/users',async (req,res) =>{
    const user=new User(req.body)
    try{
        await user.save()
        const token=await user.generateToken()
        sendmail(user.email,user.name)
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e) 
    } 
})
//   login user
router.post('/users/login',async(req,res)=>{
    try{
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token=await user.generateToken()
        res.send({user ,token})
    }catch(e){
        res.status(400).send(e) 
    }
})

// logout from one session/device
router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>token.token !== req.token)
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})
// logout from all devices
router.post('/users/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})
// user profile
router.get('/users/me',auth,async(req,res)=>{
   res.send(req.user)
})

const upload=multer({
    limits:{
        fileSize:1000000  //   file size
    },
    fileFilter(req,file,cb){  //   file extension
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/) ) {
            return cb(new Error(' please upload an image'))
        }
        cb(undefined,true)
    }
})

// upload profile pic
router.post('/upload/pic',auth,upload.single('upload'),async(req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width:300,height:300}).png().toBuffer() 
    req.user.image=buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({ error : error.message})
})

// delete profile pic
router.delete('/upload/pic',auth,async(req,res)=>{
    req.user.image=undefined
    await req.user.save()
    res.send()
})
 
// get profile pic by id
router.get('/users/:id/image',async(req,res)=>{
    try{
        const user=await User.findById(req.params.id)
        if(!user || !user.image){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.image)
    }catch(e){
        res.status(404).send()
    }
})

// update user
router.patch('/users/update',auth,async(req,res)=>{
    const updates=Object.keys(req.body)
    const allowed=['name','email','password','age']
    const isvalid=updates.every((update)=>allowed.includes(update)) // return true if all true 
    if(!isvalid){
        return res.status(404).send('error : invalid update ')
    }

    const _id=req.user._id
    try{
    updates.forEach((update)=> req.user[update]=req.body[update])
    await req.user.save()  
    res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

// delete user
router.delete('/users/delete',auth,async(req,res)=>{
    try{
        await req.user.remove()
        sendmail_for_response(req.user.email,req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})

module.exports=router