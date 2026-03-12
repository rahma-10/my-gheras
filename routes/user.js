const express = require('express')

const Router = express.Router()

let {authentication, authorization} = require('../Middlewares/authentication')
let {registerUser, getUsersNames, updateUser, deleteUser,login, updatePassword, forgetPassword, getUserById} = require('../controllers/user')


Router.post('/signup', registerUser)
Router.post('/login',login)

Router.patch('/update-password',authentication , updatePassword)
Router.delete('/:id',authentication ,authorization("admin","user"), deleteUser)


Router.get('/',authentication ,authorization("admin"), getUsersNames)
Router.get('/:id', authentication ,authorization("admin"), getUserById)
Router.patch('update-user/:id',authentication ,authorization("admin","user"), updateUser) 

Router.patch("/forget-password", forgetPassword)



module.exports = Router