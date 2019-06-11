const express=require('express');
const router=express.Router();
const auth=require('../../middleware/auth');
const {check,validationResult}=require('express-validator/check');
const Profile=require('../../models/profile');
const User=require('../../models/User');

const Post = require('../../models/Post');

//@router api/posts
/*
router.get('/',(req,res)=>{
  res.send("Posts Router");
})
*/


//@router create post       api/posts
//@desc Create a Post
//@
//@access Private
router.post('/',[auth,[
  check('text','Text is required').not().isEmpty()
]],async(req,res)=>{

  const errors=validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }

  try{
    const user=await User.findById(req.user.id).select('-password');

    const newPost= new Post({
      text:req.body.text,
      name:user.name,
      avatar:user.avatar,
      user:req.user.id
    });

    const post=await newPost.save();

    res.json(post);

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }


  res.send("Posts Router");

})

//@Get All Posts       api/posts
//@desc Get all POSTS
//@access Private
//,auth .........
router.get('/',auth,async(req,res)=>{
//res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  try{

    const posts=await Post.find().sort({ date:-1 });
    res.json(posts);

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }

})//end of router


//@Get A post By ID      api/posts/:id
//@desc Get a post by ID
//@access Private
router.get('/:id',auth,async(req,res)=>{

  try{

    const post=await Post.findById(req.params.id);

    if(!post){
      return res.status(404).json({msg:'Post not found'});
    }

    res.json(post);

  }catch(err){
    console.error(err.message);

    if(err.kind==='ObjectId'){
      return res.status(404).json({msg:'Post not found'});
    }
    res.status(500).send('Server Error');
  }

})//end of router


//@Delete Posts    api/posts/:id:
//@desc Get all POSTS
//@access Private
router.delete('/:id',auth,async(req,res)=>{

  try{

    const post=await Post.findById(req.params.id);
    ///check the user
    if(post.usertoString() !== req.user.id){
      return res.status(401).json({msg:'User not authorised'});
    }

    await post.remove();

    res.json({msg:'Post removed'});

  }catch(err){
    console.error(err.message);

    if(err.kind==='ObjectId'){
      return res.status(404).json({msg:'Post not found'});
    }

    res.status(500).send('Server Error');
  }

})//end of router

//@Add Likes   api/posts/like/:id:
//@desc Put reqeust to like a post
//@access Private

router.put('/like/:id',auth,async(req,res)=>{

  try{

    const post=await Post.findById(req.params.id);

    //check if the post has already been liked
    if(post.likes.filter(like=>like.user.toString() === req.user.id).length>0){

      return res.status(400).json({msg:'Post already liked'});

    }

    post.likes.unshift({user:req.user.id});
    await post.save();

    res.json(post.likes);

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }

})//end of router.put



//@UnLike   api/posts/unlike/:id:
//@desc Remove a like..
//@access Private

router.put('/unlike/:id',auth,async(req,res)=>{

  try{

    const post=await Post.findById(req.params.id);

    //check if the post has already been liked
    if(post.likes.filter(like=>like.user.toString() === req.user.id).length===0){

      return res.status(400).json({msg:'Post has not yet been liked'});

    }

    ///get the removed index
    const removeIndex=post.likes.map(like=>like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex,1);

    await post.save();

    res.json(post.likes);

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }

})//end of router.put



//@router comment a post    api/posts/comment/:id
//@desc Create a comment to a post
//@
//@access Private
router.post('/comment/:id',[auth,[
  check('text','Text is required').not().isEmpty()
]],async(req,res)=>{

  const errors=validationResult(req);

  if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
  }

  try{
    const user=await User.findById(req.user.id).select('-password');
    const post=await Post.findById(req.params.id);

    const newComment={
      text:req.body.text,
      name:user.name,
      avatar:user.avatar,
      user:req.user.id
    };

    post.comments.unshift(newComment);
    await post.save();

    res.json(post.comments);

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

//@router Delete comment to a post    api/posts/comment/:id/:comment_id
//@desc Delete a comment to a post
//@
//@access Private
router.delete('/comment/:id/:comment_id',auth,async(req,res)=>{

  try{

    const post=await Post.findById(req.params.id);
    //pull out comment
    const comment=post.comments.find(comment=>comment.id===req.params.comment_id);

    //Make sure comment exists
    if(!comment){
      return res.status(404).json({msg:'comment does not exist'});
    }

    ////check user
    if(comment.user.toString() !== req.user.id){
      return res.status(401).json({msg:'User not authorized'});
    }

    const removeIndex=post.comments.map(comment=>comment.user.toString()).indexOf(req.user.id);
    post.comments.splice(removeIndex,1);
    await post.save();

    res.json(post.comments);

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }


})

module.exports=router;
