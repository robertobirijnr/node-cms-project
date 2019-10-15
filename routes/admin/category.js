const express = require('express');
const router = express.Router();
const category = require('../../models/category');


router.all('/*',(req,res,next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/',(req,res)=>{
    category.find({})
    .then(categories=>{
        res.render('admin/categories/index',{categories:categories});
    })
  
});

router.post('/create',(req,res)=>{
    const newCategory = new category({
        name: req.body.name
    });

    newCategory.save().then(saveCategory=>{
        res.redirect('/admin/categories');
    });
    
});

router.get('/edit/:id',(req,res)=>{
    category.findOne({_id: req.params.id}).then(category=>{
        res.render('admin/categories/edit',{category:category});
    })
  
});

router.put('/edit/:id',(req,res)=>{
    category.findOne({_id: req.params.id}).then(category=>{
        category.name = req.body.name;
        category.save().then(saveCategory=>{
            res.redirect('/admin/categories');
        })
       
    })
  
});

router.delete('/:id',(req,res)=>{
  category.remove({_id:req.params.id}).then(result=>{
     res.redirect('/admin/categories') 
  })  
})






module.exports = router;