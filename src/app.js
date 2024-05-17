import express from "express"
import CONFIG from "./config/config.js"
import cors from 'cors'
import mongoose from "mongoose"
import { Server } from "socket.io"
import session from "express-session";
import MongoStore from "connect-mongo";
import handlebars from 'express-handlebars'
import passport from "passport";
import initPassport from "./config/passport.config.js"
import messagesController from './controllers/messages.controller.js';
import appRouter from './routers/app.router.js'
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const{ PORT, MONGO_URI } = CONFIG
const app= express();
const httpServer = app.listen(PORT,()=>console.log(`Server up in ${PORT}`))
const io = new Server(httpServer)

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.engine('handlebars',handlebars.engine());
app.set('views',__dirname+'/views')
app.set('view engine','handlebars');
app.use(express.static(__dirname + "/public"));

app.use(session({
  store: MongoStore.create({
    mongoUrl:MONGO_URI,
    ttl:3600
  }),
  secret:"12345abcd",
  resave:false,
  saveUninitialized:false
}))

initPassport();
app.use(passport.session({
  secret:"SecretCoders"
}));

app.use(passport.initialize())
app.use ('/' ,appRouter)

mongoose.set('strictQuery',false)
mongoose.connect(CONFIG.MONGO_URI)
.then(()=>{
  console.log("Connect DB")
})
.catch((error)=>{
  console.log("Failed to connect DB")
  throw error
})


const messages=[];
io.on('connection',socket=>{
  socket.on('message', data=>{
    messages.push(data)
    io.emit('messageLogs',messages)
    messagesController.createMessage(data)
  })
})