const express = require("express");
const http = require("http");
const {Server}=require("socket.io")
const cors = require("cors");
const app=express()
const server=http.createServer(app);
const io=new Server(server,{
  cors:{origin:'http://localhost:3000',
    methods: ["GET", "POST"],
  }
})

const users={}

//middleware
app.use(express.json());
app.use(cors());
 
//connections

io.on("connection",(socket)=>{
  console.log("user is connected")

  socket.on('newUserJoined',(name)=>{
    users[socket.id]=name;
    socket.broadcast.emit('User joined',{name, id:socket.id})
    console.log(name)
  }); 
  socket.on('send',(msg)=>{
    io.emit('message sent',{ msg, user: users[socket.id] })
    console.log(msg)
  });
  socket.on('disconnect',()=>{
    socket.broadcast.emit('user disconnected',{name:users[socket.id], id:socket.id});
    delete users[socket.id];
  })
  socket.on("play-audio", () => {
    socket.broadcast.emit("play-audio"); 
  });
})

app.get("/", (req, res) => {
  res.send("WhatsApp Clone Server is Running!");
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
