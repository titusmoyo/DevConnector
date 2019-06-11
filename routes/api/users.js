const express=require('express');
const router=express.Router();
const {check,validationResult}=require('express-validator/check');
const gravatar=require('gravatar');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const config =require('config');
//get user Model
const User=require('../../models/User');
//@router api/users
//GET REquests
router.post('/',[
  check('name','name is requred').not().isEmpty(),
  check('email','Please enter a valid email').isEmail(),
  check('password','Please enter a password with 6 or more characters').isLength({min:6})
],async (req,res)=>{
  const errors=validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }

  const {name,email,password}=req.body;

  try{

    let user=await User.findOne({email});

    if(user){
      res.status(400).json({errors:[{msg:'user already exists'}]});
    }
    //get users Gravatar

    const avatar=gravatar.url(email,{
      s:'200',
      r:'pg',
      d:'mm'
    })

    user=new User({
      name,
      email,
      avatar,
      password
    });
    //encrypt password using Bcrypt
    const salt=await bcrypt.genSalt(10);
    user.password=await bcrypt.hash(password,salt)
    await user.save();

    const payload={
      user:{
        id:user.id
      }
    }

    jwt.sign(payload,config.get('jwtSecret'),{expiresIn:360000},(err,token)=>{
      if(err)throw err;
      res.json({token});
    })
    //return jsonwebToken
    //console.log("done now ..user saved")
    //res.send("User registered yeah");

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }

})///end of user Regsitration Route


module.exports=router;
/*
console.log("Damnnnnnnnnnnnnnnnnnn");
const errors=validationResult(req);

if(!errors.isEmpty()){
  return res.status(400).json({errors:errors.array()});
}

const {name,email,password}=req.body;
console.log("outside here");

let user=User.findOne({email});

if(user){
  res.status(400).json({errors:[{msg:'user already exists'}]});
}
//get users Gravatar

const avatar=gravatar.url(email,{
  s:'200',
  r:'pg',
  d:'mm'
})

user=new User({
  name,
  email,
  avatar,
  password
});
//encrypt password using Bcrypt
const salt=bcrypt.genSalt(10);
user.password=bcrypt.hash(password,salt)
user.save();
//return jsonwebToken
console.log("done now ..user saved")
res.send("User registered yeah");
*/
