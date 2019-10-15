const express = require('express');
const router = express.Router();
const Post = require('../../models/post');
const Comment = require('../../models/Comment');


router.post('/',(req,res)=>{
    Post.findOne({_id:req.body.id})
    .then(post=>{
        console.log(post)
        const newComment = new Comment({
            body: req.body.body
        })
        post.comments.push(newComment);
        post.save()
        .then(savePost=>{
            newComment.save()
            .then(saveComment=>{
                res.redirect(`/post/${post.id}`);
            })
        })
    })
   
})

module.exports = router;