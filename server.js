const express=require('express');
const connectDB=require('./config/db')
const app=express();


//connect dabtabse
connectDB();

//init middleware
app.use(express.json({extended:false}))

app.get('/',(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.json({running: "Api running Mr Brian zhou"})
})

///define Routes
app.use('/api/users',require('./routes/api/users'));
app.use('/api/auth',require('./routes/api/auth'));
app.use('/api/profile',require('./routes/api/profile'));
app.use('/api/posts',require('./routes/api/posts'));

const PORT=process.env.PORT|| 5000;
app.listen(PORT,()=>{
  console.log(`server started on port ${PORT}`);
})
