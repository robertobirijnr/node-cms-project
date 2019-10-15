const express = require('express');
const router = express.Router();
const Post = require('../../models/post');
const Category = require('../../models/category');
const User  = require('../../models/User');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');





router.all('/*',(req,res,next)=>{
    req.app.locals.layout = 'home';
    next();
});

router.get('/',(req,res)=>{
    Post.find({}).then(posts=>{
        Category.find({}).then(categories=>{
            res.render('home/index',{posts:posts,categories:categories});
        });
      
    });
    
});


router.get('/signup',(req,res)=>{
    res.render('home/signup');
});

router.get('/signin',(req,res)=>{
    res.render('home/signin');
});


// User register

router.post('/register',(req,res)=>{
 let errors = [];
  
 if(!req.body.firstName){
     errors.push({message:'Please enter your first name'})
 }

 if(!req.body.lastName){
     errors.push({message:'Please enter last name'})
 }

 if(!req.body.email){
     errors.push({message:'Please enter email address'})
 }

 if(req.body.password !== req.body.passwordConfirm){
     errors.push({message:'Password do not match'})
 }

 if(errors.length > 0){
     res.render('home/signup',{
         errors:errors,
         firstName:req.body.firstName,
         lastName:req.body.lastName,
         email:req.body.email,
     });
 }else{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length >= 1){
            return res.status(409).json({
                message:'Mail exist'
            })
        }else{
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err){
                    return res.status(500).json({
                        error:err
                    })
                }else{
                    const user = new User({
                        firstName:req.body.firstName,
                        lastName:req.body.lastName,
                        email:req.body.email,
                        password:hash
                    });
                    user.save()
                    .then(result=>{
                        console.log(result);
                        req.flash('success_message','You are now registered, please login')
                        res.redirect('/signin')   
                        res.status(201).json({
                            message:'User Created'
                        });
                    })
                    .catch(err=>{
                        console.log(err)
                        return res.status(401).json({
                            message:'Auth failed'
                        })
                    })
                }
            })
        }
    })
    

     
 }
});

router.post('/login',(req,res,next)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length < 1){
            req.flash('error','You are now registered, please login')
            return res.status(401).json({
                message:'Auth failed'
            });
        }
        bcrypt.compare(req.body.password, user[0].password,(err,result)=>{
            if(err){
                req.flash('error','You are now registered, please login')
                return res.status(404).json({
                    message:'Auth failed'
                });
            }
            if(result){
              jwt.sign(
                {
                    email: user[0].email,
                    userId: user[0]._id
                },
               'secret',
                {
                    expiresIn:"1hr"
                }
                );
                res.redirect('/api/admin')   
            }
        });
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error:err
        })
    })

});

router.get('/logout', function(req,res,next){
    if(req.session){
        req.session.destroy(function(err){
            if(err){
                return next(err);
            }else{
                return res.redirect('/signin')
            } 
        })
    }
})
router.get('/post/:id',(req,res)=>{
    Post.findOne({_id: req.params.id})
    .then(post=>{
        Category.find({}).then(categories=>{
            res.render('home/post',{post:post,categories:categories});
        })
      
    })
})


module.exports = router;   