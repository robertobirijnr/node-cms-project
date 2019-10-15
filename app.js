const express = require('express');
const path  = require('path');
const exphbs = require('express-handlebars');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const {mongoDbUrl} =require('./config/database')

mongoose.connect(mongoDbUrl,{ useNewUrlParser: true,useUnifiedTopology: true } ).then(db=>{
    console.log('Mongo connected');
}).catch(error =>console.log('Couldnt connect'+error));



app.use(express.static(path.join(__dirname,'public')));

const {select,generateTime} = require('./helpers/handlebars-helpers');
//Set View Engine
app.engine('handlebars',exphbs({defaultLayout:'home',helpers:{select:select, generateTime:generateTime}}));
app.set('view engine','handlebars');

//middleware
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(upload());
app.use(session({
    secret:'bobalaska123lovenode',
    resave:true,
    saveUninitialized:true
}));
app.use(flash());

//Local variables using middleware
app.use((req,res,next)=>{
    res.locals.user = req.user ||  null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.form_errors = req.flash('form_errors');
    res.locals.error = req.flash('error')
    next();
})

//method override
app.use(methodOverride('_method'));




//load Route
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/category');
const comments = require('./routes/admin/comments');

//use Routes
app.use('/',home);
app.use('/api/admin',admin);
app.use('/api/admin/posts',posts);
app.use('/api/admin/categories',categories);
app.use('/api/admin/comments',comments);


app.listen(5000,()=>{
    console.log(`listening on port 5000`);
});  