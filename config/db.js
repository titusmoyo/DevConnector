const mongoose=require('mongoose');
const config=require('config');

const db=config.get('mongoURI');

const connectDB=async()=>{

  try{
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex:true,
      useFindAndModify:false 
    });
    console.log("MongoDb connected : success");
  }catch(err){
    console.log(err.message);
    //exit process with failure
    process.exit(1);
  }

}//end of connectDB


module.exports=connectDB;
