/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Rahul Kumar Student ID: 157197211 Date: 12\10\2022
*
*  Online (Heroku) Link: https://mysterious-brook-32823.herokuapp.com/
*
********************************************************************************/ 



let HTTP_PORT = process.env.PORT || 8080;
let express = require("express");
let app = express();
let path = require("path");
let blog_service = require("./blog-service");
let authData = require("./auth.service");
let clientSessions = require("client-sessions");

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: 'dmpvhucth',
    api_key: '515152138723923',
    api_secret: 'uPw2gm_P4CgEu0Zft3E1Iiz-i58',
    secure: true
});

const upload = multer(); 

const exphbs = require("express-handlebars");
const stripJs = require('strip-js');

const { json } = require("sequelize");
const e = require("express");

app.use(clientSessions({
    cookieName: "session", 
    secret: "Assignment_6", 
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
  }));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
  });

  function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
  }
  

app.engine('.hbs', exphbs.engine({ extname: '.hbs',helpers: { 
    navLink: function(url, options){
        return '<li' + 
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    },
    safeHTML: function(context){
        return stripJs(context);
    },
    formatDate: function(dateObj){
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
    }
       
} }));
app.set('view engine', '.hbs');


function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('./public/site.css'));
app.use(express.urlencoded({extended: true}));

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});


app.get("/", (req, res) => {
    res.redirect("/blog");
});



app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog_service.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog_service.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog_service.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});


app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog_service.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog_service.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        var pos = [];
        pos  = await blog_service.getPostById(req.params.id);
        viewData.post = pos[0];
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog_service.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});




app.get("/about", function(req,res){
    res.render('about', {
        layout: 'main'
    });
});

app.get("/posts/add", ensureLogin, function(req,res){
    blog_service.getCategories().then((data)=>{
        res.render("addPost", {categories: data});
      }).catch((err)=>{
        res.render("addPost", {categories: []}); 
      })
});




app.get("/posts", ensureLogin, function(req,res){
    if(req.query.category){
        blog_service.getPostsByCategory(req.query.category).then((data) => {
          if(data.length >0){
            res.render("posts", {posts: data});}
          else{
            res.render("posts",{ message: "no results" });
          }
      }).catch((error) => {
          res.render("posts", {message: "no results"});
      }) 
    }else if (req.query.minDate) {
        blog_service.getPostsByMinDate(req.query.minDate).then((data) => {
            if(data.length >0){
              res.render("posts", {posts: data});}
            else{
              res.render("posts",{ message: "no results" });
            }
        }).catch((error) => {
            res.render("posts", {message: "no results"});
        }) 
    }else{
        blog_service.getAllPosts().then((data) => {
            if(data.length >0){
              res.render("posts", {posts: data});}
            else{
              res.render("posts",{ message: "no results" });
            }
          })
          .catch((err)=>{
            res.render("posts", {message: "no results"});
          })
    }
});

app.get("/posts/:val", ensureLogin, function(req, res){
    blog_service.getPostById(req.params.val).then((data) =>{
        res.render("posts", {posts: data});
    }).catch((err) =>{
        res.render("posts", {message: "no results"});
    })
})

app.get("/posts/delete/:id", ensureLogin, function(req,res){
    blog_service.deletePostById(req.params.id).then((data) =>{
        res.redirect("/posts");
    }).catch((err) =>{
        res.status(500).render("Unable to Remove Post / Post not found", {layout: 'main'})
    })
});






app.post('/posts/add', ensureLogin, upload.single("featureImage"), function (req, res) {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            if(req.file){
            streamifier.createReadStream(req.file.buffer).pipe(stream);
            }
        });
    };

    async function upload(req) {
        if (req.file) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
        }
    }

    upload(req).then((uploaded) => {
        if (req.file) {
        req.body.featureImage = uploaded.url;
        }else{
            req.body.featureImage = "https://dummyimage.com/847x320/d9d9d9/545454.jpg";
        }
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blog_service.addPost(req.body).then((data) => {
            res.redirect('/posts')
          }).catch((error) => {
            res.status(500).send(error)
        })


    });
});



app.get("/categories", ensureLogin, function(req,res){
    blog_service.getCategories().then((data) => {
        if(data.length >0){
          res.render("categories", {categories: data});}
        else{
          res.render("categories", {message: "no results"});
        }
      })
      .catch((err)=>{
        
        res.render("categories", {message: "no results"});
    });
});

app.get("/categories/add", ensureLogin, function(req,res){
    res.render("addCategory", {
        layout: 'main'
    });
});

app.post("/categories/add", ensureLogin, function(req,res){
    blog_service.addCategory(req.body).then(() => {
        res.redirect('/categories')
    }).catch((error) => {
        res.status(500).send(error);
    });
});

app.get("/categories/delete/:id", ensureLogin, function(req,res){
    blog_service.deleteCategoryById(req.params.id).then((data) => {
        res.redirect("/categories")
  
    }).catch((error) => {
        console.log(error)
        res.status(500).send("Unable to Remove Category / Category not found!")
    })   
});




app.get('/login',(req,res)=>{
    res.render("login", {
        layout: 'main'
    });
});

app.get('/register',(req,res)=>{
    res.render("register", {
        layout: 'main'
    });
});

app.post('/register',(req,res)=>{
    authData.registerUser(req.body).then((data) => {
        res.render('register', {
            layout: "main",
            successMessage: "USER CREATED"
        })
    }).catch((error) => {
        res.render('register', {
            layout: "main",
            errorMessage: error,
            userName: req.body.userName
        })
    })
});

app.post('/login',(req,res)=>{
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body)
    .then((user)=>{
        req.session.user ={
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect('/posts');
    })
    .catch((err)=>{
        res.render("login", {errorMessage:err, userName:req.body.userName} )
    })
});

app.get('/logout',(req,res)=>{
    req.session.reset();
    res.redirect("/");
});

app.get('/userHistory', ensureLogin,(req,res)=>{
    res.render("userHistory", {
        layout: 'main'
    });
});


app.get("/*", function(req,res){
    res.status(404).render("404", {layout: 'main'})
});


blog_service.initialize().then(authData.initialize)
.then(() => {
    app.listen(HTTP_PORT, onHttpStart);
}).catch(() => {
    console.log("Unable to load data");
});




    