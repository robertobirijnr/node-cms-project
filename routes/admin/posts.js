const express = require('express');
const router = express.Router();
const Post = require('../../models/post');
const Category = require('../../models/category');
const {isEmpty,uploadDir} = require('../../helpers/upload-helpers')
const fs = require('fs');


router.all('/*',(req,res,next)=>{
    req.app.locals.layout = 'admin';
    next();
});
//Read All Post
router.get('/',(req,res)=>{
    Post.find({})
    .populate('category')
    .then(posts=>{
        res.render('admin/posts',{posts:posts})
    })  
});

//Edit post
router.get('/edit/:id',(req,res)=>{
    Post.findOne({_id: req.params.id}).then(post=>{
        Category.find({}).then(categories =>{
            res.render('admin/posts/edit',{post:post,categories:categories}) 
        })
       
    })
});

//create post
router.get('/create',(req,res)=>{
    Category.find({}).then(categories =>{
        res.render('admin/posts/create.handlebars',{categories:categories});
    })
  
});

router.post('/create',(req,res)=>{
    let filename = ''
    if(!isEmpty(req.files)){ 
    let file = req.files.file;
    filename = Date.now()+'-'+ file.name;
    let dirUploads = './public/uploads/';
    file.mv(dirUploads +filename,(err)=>{
        if(err) throw err;
    });
    }
        let allowComments = true;

        if(req.body.allowComments){
            allowComments = true;
        }else{
            allowComments = false;
        }
   const newPost = Post({
        title:req.body.title,
        status:req.body.status,
        allowComments:allowComments,
        body:req.body.body,
        file:filename,
        category:req.body.category   
    });
    newPost.save().then(savePost =>{
        req.flash('success_message',`Post ${savePost.title} was created successfuly`)
        res.redirect('/api/admin/posts');
    }).catch(err=>{
        console.log('could not post'+ err)
    });
});

//Update post
router.put('/edit/:id',(req,res)=>{
    Post.findOne({_id: req.params.id}).then(post=>{
        if(req.body.allowComments){
            allowComments = true;
        }else{
            allowComments = false;
        }
        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.body = req.body.body
        category=req.body.category;

        if(!isEmpty(req.files)){  
            let file = req.files.file;
            filename = Date.now()+'-'+file.name;
            post.file = filename;
            let dirUploads = './public/uploads/';
        
            file.mv(dirUploads +filename,(err)=>{
                if(err) throw err;
            });
            }
        post.save().then(updatedPost=>{
            req.flash('success_message')
            res.redirect('/api/admin/posts')
        });
    });
});

//Delete
router.delete('/:id',(req,res)=>{
    Post.findOne({_id: req.params.id})
    .then(post=>{
        fs.unlink(uploadDir + post.file,(err)=>{
            post.remove();
           
            res.redirect('/api/admin/posts');
        });
        
    });
})



module.exports = router;