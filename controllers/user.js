const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto =require('crypto') // bulit in Node for encryption

let userModel = require('../models/user')
let sendEmail = require('../utils/sendEmail')

let registerUser = async (req, res) =>{
    try{

        let userData = req.body

        const newUser = await userModel.create(userData)
        res.status(201).json({message: "user has been created",
            user : newUser
        })

    }catch(err){
        if(err.code === 11000){
            return res.status(400).json({message:"username already exist"})
        }
        res.status(400).json({message: "Resgistration failed", error: err.message})
    }
}


let getUsersNames = async (req, res) => {
    try{
    
        const users = await userModel.find().select('firstName , email')
        res.status(200).json(users)


    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

let getUserById = async (req, res) =>{
    try{
        let userId = req.params.id
        const user = await userModel.findById(userId)
        res.status(200).json(user)
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

let updateUser = async (req, res) =>{
    try{
        const userId = req.params.id
        const updates = req.body
        
        const updatedUser = await userModel.findByIdAndUpdate(userId, updates, {new:true, runValidators:true})
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({message:"User has been updated", user: updatedUser})
    }catch(err){

        if (err.code === 11000) {
            return res.status(400).json({ message: "Username already exists" });
        }
        res.status(400).json({ 
            message: "Update failed", 
            error: err.message 
        })
    }
}


let deleteUser = async (req, res) =>{
    try{
        const userId = req.params.id
        const deletedUser = await userModel.findByIdAndDelete(userId)
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.status(200).json({ 
            message: "User deleted successfully",
            userId: userId 
        })
    }catch(err){
        res.status(500).json({ 
            message: "Delete failed", 
            error: err.message 
        })
    }
}



let login = async (req, res)=>{
    try{

        let {email, password} = req.body
        if(!email || !password){
            return res.status(400).json({message:"Please enter email and password correctly"})
        }

        let user = await userModel.findOne({email: email})

        if(!user){
            return res.status(404).json({message:"invalid email or password"})
        }

        let isValid = await bcrypt.compare(password, user.password)

        if(isValid == false){
            return res.status(401).json({message:"neither email or password is invalid"})
        }

        let token = jwt.sign({id: user._id, email: user.email, role: user.role}, process.env.SECRET_KEY)
        res.status(200).json({token:token})
    }catch(error){
        res.status(500).json(error.message)
    }
}


let updatePassword = async(req, res)=>{
    try{

        let {currentPassword, newPassword} = req.body

        if(!currentPassword || !newPassword){
            return res.status(400).json({status:"Error" , message:"please enter current or password"})
        }

        let user = await userModel.findById(req.userId)

        if(!user){
            return res.status(404).json({status:"Error" ,message:"inValid please login first" })
        }

        let valid = await bcrypt.compare(currentPassword , user.password)

        if(!valid){
            return res.status(400).json({status:"faild", message:"please enter right currentPassword"})
        }

        user.password = newPassword
        await user.save()

        let token = jwt.sign({id:user._id , email: user.email , role:user.role}, process.env.SECRET_KEY , { expiresIn: '1d' })

        res.status(200).json({token: token})

    }catch(error){
         res.status(500).json(error.message)
    }
}


//مكتبه تأكيد عبر الايميل
let forgetPassword = async(req, res)=>{

    let { email } = req.body;

        let user = await userModel.findOne({email: email})

        if(!user){
           return res.status(404).json({message:"No User with this email "})
        }

        
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashResetCode = crypto.createHash('sha256') // sha256 this algorithm
               .update('resetCode')
               .digest('hex');
        user.resetCode = hashResetCode;
            // console.log(resetCode)
            // console.log(hashResetCode)

        // save hashed reset code in database
        user.passwordResetCode = hashResetCode;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000 ;  // code expires afrt (10 min)
        user.passwordVerified = false;
        user.save()


        const message = `
        <h2>Hi ${user.firstName}</h2>

        <p>You received a request for a password reset on <b>Gheras Website</b></p>

        <h1 style="color:green;">${resetCode}</h1>

        <p>This code will expire in 10 minutes.</p>

        <p>Best regards,<br>Gheras Team</p>
        `;
try{
    await sendEmail({
        email: user.email,
        subject: "Password Reset Code Vaild for 10 minutes",
        message: message
    })

    res.status(200).json({message:"Reset code sent to your email"})   
    }catch(err){
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        user.passwordVerified = undefined;
        await user.save();

        res.status(500).json({message:"Error sending email", error: err.message})
    }
}

module.exports = {registerUser, getUsersNames, updateUser, deleteUser, login,updatePassword, forgetPassword, getUserById}