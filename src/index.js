const express = require('express')
require('./db/mongoose')
const user_router=require('./routers/user')
const task_router=require('./routers/task')

const app = express()
const port=process.env.PORT

app.use(express.json())
app.use(user_router)
app.use(task_router)
  

app.listen(port,()=>{
    console.log("  server is running on port ",port)
})



