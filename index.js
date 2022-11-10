const express = require('express')
const cors = require('cors')
const mongoose = require("mongoose")
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const messageRoutes = require('./routes/messageRoutes')

const app = express()
require('dotenv').config()

const corsOptions = {
  origin: [
    `${process.env.CLIENT_URL}`,
    `http://localhost:${process.env.CLIENT_URL}`,
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/message', messageRoutes)

app.get('/', (req, res) => {
  res.send('Hi there')
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connection Success"))
  .catch((err) => console.log('DB connection Error', err.message))

const server = app.listen(process.env.PORT, () => {
  console.log(`App is listening to port ${process.env.PORT}`)
})

// socket.io
const io = require('socket.io')(server, corsOptions)

const onlineUsers = {}

io.on('connection', socket => {
  socket.on('add-user', (userId) => {
    onlineUsers[userId] = socket.id
  })

  socket.on('input-message', messageData => {
    const socketId = onlineUsers[messageData.to]
    socket.to(socketId).emit('client-receive-msg', messageData)
  })

  socket.on('logout', (userId) => {
    delete onlineUsers[userId]
  })
})