// For intialzing we have to first initialize the express by setting up npm init then npm i express
const express = require('express')
const path = require('path') 
const http = require('http')

const socketio = require('socket.io') 

const Filter = require('bad-words')
const {gene,geneM} = require('./utils/messages')
// const {addUser,removeUser,getUser,getUserinRoom} = require('./utils/users')

// const {addUser,removeUser,getUser,getUserInRoom} = require('./utils/users')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express() //for generating

const server = http.createServer(app)

const io = socketio(server) // here server is pass explicitly

// setting up port 
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))



let cnt = 0;
io.on('connection',(socket)=>
{
     console.log('New Websocket Connection') 

    socket.emit('Message',gene('Welcome!')); 

    socket.on('join',(option,callback)=>{
        const {error,user} = addUser({ id: socket.id, ...option})
        if (error) 
        {
            return callback(error)
        }
        socket.join(user.room) // this is for joining the room
        // socket.emit('Message',gene('Admin','Welcome!'));
        socket.broadcast.to(user.room).emit('Message',gene(`${user.username} has joined!`))

        // io.to(user.room).emit('roomData',{
        //     room: user.room,
        //     users:getUserInRoom(user.room)
        // })
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendlocation',(coords,callback)=>{
    //   io.emit('Message',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`) // io is send for all
    //   io.emit('locationMessage',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
    const user = getUser(socket.id)
      io.to(user.room).emit('locationMessage',geneM(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
      callback()
    })

    // socket.on('sendMessage',(maggi) =>{
    //     io.emit('Message',maggi)
    // })
    socket.on('sendMessage',(maggi,callback) =>
    {
        const user = getUser(socket.id)
        if (!user) {
            return callback('User not found');
        }
        const filter = new Filter()
        if(filter.isProfane(maggi))
        {
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('Message',gene(user.username,maggi))
        // callback('Delivered')
        callback()
    })

    // when user leave
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if (user) 
        {
            io.to(user.room).emit('message',gene('Admin', `${user.username} has left!`))

            // io.to(user.room).emit('roomData',{
            //     room: user.room,
            //     users:getUserInRoom(user.room)
            // })

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            
            // io.to(user.room).emit('roomData',{
            //     room: user.room,
            //     users: getUserinRoom(user.room)
            // })
        }
        // io.emit('Message',gene('A user is leaved!'))
    })

})


server.listen(port,() =>{
    console.log(`Server is up on port ${port}!`)
})

// we are adding start :- node src/index.js in package json
