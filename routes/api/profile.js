const express=require('express');
const router=express.Router();
const auth=require('../../middleware/auth');
const Profile=require('../../models/profile');
const User=require('../../models/User');
const {check,validationResult}=require('express-validator/check');
const request=require('request');
const config=require('config');


//@router api/profile/me
//@Get current users profile
router.get('/me',auth,async(req,res)=>{

  try{
    const profile=await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);

    if(!profile){
      return res.status(400).json({msg:'There is no profile for this user'});
    }

    res.json(profile);

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }


})///end of router.get


//@router api/profile
//@POST request to create or update a users profile
//@access Private
router.post('/',[auth,[
  check('status','Status is required').not().isEmpty(),
  check('skills','skills is required').not().isEmpty()
]],async(req,res)=>{

  const errors=validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }

  const {
    company,website,
    location,bio,status,
    githubusername,skills,
    youtube,facebook,
    twitter,instagram,linkedin}=req.body;

    ///build Profile Object

    const profileFields={};
    profileFields.user=req.user.id;
    if(company) profileFields.company=company;
    if(website) profileFields.website=website;
    if(location) profileFields.location=location;
    if(bio) profileFields.bio=bio;
    if(status) profileFields.status=status;
    if(githubusername) profileFields.githubusername=githubusername;

    if(skills) {
      profileFields.skills=skills.split(',').map(skill=>skill.trim())
    }//

    ///build a social Object
    profileFields.social={}
    if(youtube) profileFields.social.youtube=youtube;
    if(twitter) profileFields.social.twitter=twitter;
    if(facebook) profileFields.social.facebook=facebook;
    if(linkedin) profileFields.social.linkedin=linkedin;
    if(instagram) profileFields.social.instagram=instagram;

    try{

      let profile=await Profile.findOne({user:req.user.id})
      if(profile){
        ///UpDate
        profile=await Profile.findOneAndUpdate(
          {user:req.user.id},
          {$set:profileFields},
          {new:true}
        );
        return res.json(profile)
      }

      //if ther is no Profile
      profile=new Profile(profileFields);

      await profile.save();
      res.json(profile);
    }catch(err){
      console.error(err.message);
      res.status(500).send('Server Error');
    }
    //console.log(skills);
    //console.log(profileFields.skills);
    res.send(status);

})


//geting all profiles
//@router api/profile
//@GET request to create or update a users profile
//@access Public
router.get('/',async(req,res)=>{
  try{

    const profiles=await Profile.find().populate('user',['name','avatar']);
    res.json(profiles);

  }catch(err){
    console.error(err.message);
  }

})


//geting all GET api/profiles/user/:user_id
///////////////by user_id
//@router api/profile
//@GET profile by ID
//@access Public
router.get('/user/:user_id',async(req,res)=>{

  try{
    const profile=await Profile.findOne({ user: req.params.user_id }).populate('user',['name','avatar']);

    if(!profile) return res.status(400).json({ msg: 'profile not found1' })

    res.json(profile);


  }catch(err){
    console.error(err.message);

    if(err.kind=='ObjectId'){
      res.status(400).json({ msg: 'profile not found2' })
    }

    res.status(500).send('Server Error');
  }

})////end of GET api/profiles/user





//Delete Request .............
//@router Delete profile,user,posts
//@GET request to create or update a users profile
//@access Public
router.delete('/',auth,async(req,res)=>{
  try{

    //remove profile
    await Profile.findOneAndRemove({ user:req.user.id });

    //remove user
    await User.findOneAndRemove({ _id:req.user.id });
    res.json({msg:'User deleted'});

  }catch(err){
    console.error(err.message);
  }

})//end of delete


//Add experience
//@router PUT api/profile/experience
//@GET Add profile experience
//@access Public
router.put('/experience',[auth,[
  check('title','Title is required').not().isEmpty(),
  check('company','company is required').not().isEmpty(),
  check('from','from date is required').not().isEmpty()
]],async(req,res)=>{

  const errors=validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }

  const {title,company,location,from,to,current,description}=req.body;

  const newExp={
    title,company,location,from,to,current,description
  }

  try{
    const profile=await Profile.findOne({ user: req.user.id });
    profile.experience.unshift(newExp);
    await profile.save();

    res.json(profile);

  }catch(err){
    console.err(err.message);
    res.status(500).send('Server Error');
  }

})///end of router.put

//Delete Request .............remove a experience
//@router Delete api/profile/experience/:exp_id
//@access Private

router.delete('/experience/:exp_id',auth,async(req,res)=>{

  try{

    const profile=await Profile.findOne({ user: req.user.id });
    ///GET remove index
    const removeIndex=profile.experience.map(item=>item.id).indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex,1);

    await profile.save();

    res.json(profile);

  }catch(err){
    console.err(err.message);
    res.status(500).send('Server Error');
  }

});//end of router.delete



//Add experience
//@router PUT api/profile/education
//@add Educatiom
//@access Public
router.put('/education',[auth,[
  check('school','school is required').not().isEmpty(),
  check('degree','degree is required').not().isEmpty(),
  check('fieldofstudy','fieldofstudy is required').not().isEmpty(),
  check('from','from is required').not().isEmpty()
]],async(req,res)=>{

  const errors=validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }

  const {school,degree,fieldofstudy,from,to,current,description}=req.body;

  const newEdu={
    school,degree,fieldofstudy,from,to,current,description
  }

  try{
    const profile=await Profile.findOne({ user: req.user.id });
    profile.education.unshift(newEdu);
    await profile.save();

    res.json(profile);

  }catch(err){
    console.err(err.message);
    res.status(500).send('Server Error');
  }

})///end of router.put

//Delete Request .............remove a Education
//@router Delete api/profile/education/:exp_id
//@access Private

router.delete('/education/:edu_id',auth,async(req,res)=>{

  try{

    const profile=await Profile.findOne({ user: req.user.id });
    ///GET remove index
    const removeIndex=profile.education.map(item=>item.id).indexOf(req.params.edu_id);
    profile.education.splice(removeIndex,1);

    await profile.save();

    res.json(profile);

  }catch(err){
    console.err(err.message);
    res.status(500).send('Server Error');
  }

});//end of router.delete


//GET Request ..........get github resiperetories
//@router GET api/profile/github/:username
//@access public
//get Usesr repos
router.get('/github/:username',(req,res)=>{

  try{

    const options={
      uri:`https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret${config.get('githubSecret')}`,
      method:'GET',
      headers:{'user-agent':'node.js'}
    };

    request(options,(error,response,body)=>{
      if(error) console.error(error);

      if(response.statusCode !== 200){
        res.status(404).json({ msg:'No gitHub profile found' });
      }

      res.json(JSON.parse(body));

    });

  }catch(err){
    console.err(err.message);
    res.status(500).send('Server Error');
  }

})


module.exports=router;
