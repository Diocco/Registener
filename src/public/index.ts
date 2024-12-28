(()=>{
    require('dotenv').config()
    const Server = require('./models/server')
    const express= new Server()
    express.start()
    
})()
