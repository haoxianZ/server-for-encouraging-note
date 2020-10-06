const path = require('path')
const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')
const NotesService = require('../notes-service')

const { use } = require('chai')
const usersRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user =>({
    id: user.id,
    username:xss(user.username),
    email: xss(user.email)
})

usersRouter.route('/').get((req,res,next)=>{
    const knexInstance = req.app.get('db')
    const username = req.query.username
    const email = req.query.email
    if(username){
        UsersService.getByUsername(knexInstance,username,email)
    .then(user=>{
        if(!user){
            return res.status(401).json({
                error:{message:'I cannot find the user matach this username and email'}
            })
        }
        res.json(serializeUser(user))})
    .catch(next)
    }
    else {UsersService.getAllUsers(knexInstance)
    .then(users=>{res.json(users.map(serializeUser))})
    .catch(next)}
    
}).post(jsonParser,(req,res,next)=>{
    const {username, email} = req.body
    const newUser = { username }

    for(const [key,value] of Object.entries(newUser)){
        if(value == null){
            return res.status(400).json({
                error:{message:`Missing '${key}' in request body`}
            })
        }
    }
    newUser.email = email
    UsersService.insertUser(req.app.get('db'), newUser)
    .then(user=>{
        res.status(201)
        .location(path.posix.join(req.originalUrl,`/${user.id}`))
        .json(serializeUser(user))
    }).catch(next)
})


usersRouter.route('/:user_id').all((req,res,next)=>{
    UsersService.getById(req.app.get('db'),
    req.params.user_id).then(user=>{
        if(!user){
            return res.status(404).json({
                error:{message:`User doesn't exist`}
            })
        }
        //validation by email


        res.user = user
        next()
    }).catch(next)
}).get((req,res,next)=>{
    res.json(serializeUser(res.user))
}).delete((req,res,next)=>{
    UsersService.deleteUser(req.app.get('db'),
    req.params.user_id).then(numRowsAffected=>{
        res.status(204).end()
    }).catch(next)
}).patch(jsonParser, (req,res,next)=>{
    const { username, email} = req.body
    const userToUpdate = { username, email }
    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
    if(numberOfValues ===0){
        return res.status(400).json({
            error:{message:'Request must contain username or email'}
        })
    }
    UsersService.updateUser(req.app.get('db'),req.params.user_id,userToUpdate)
    .then(numRowsAffected=>{
        res.status(204).end()
    }).catch(next)
})

usersRouter.route('/:user_id/notes').get((req,res,next)=>{
    NotesService.getNoteforUser(req.app.get('db'),req.params.user_id)
    .then(notes=>{
        res.json(notes)
    }).catch(next)
})

module.exports = usersRouter