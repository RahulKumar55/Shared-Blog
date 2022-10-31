/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Rahul Kumar Student ID: 157197211 Date: 10\30\2022
*
*  Online (Heroku) Link: https://mysterious-brook-32823.herokuapp.com/
*
********************************************************************************/ 



let HTTP_PORT = process.env.PORT || 8080;
let express = require("express");
let app = express();
let path = require("path");
let blog_service = require("./blog-service");

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
    }    
} }));
app.set('view engine', '.hbs');


function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('./public/site.css'));

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
        viewData.post = await blog_service.getPostsById(req.params.id);
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

app.get("/posts/add", function(req,res){
    res.render('addPost', {
        layout: 'main'
    });
});


app.get("/posts", function(req,res){
    if (req.query.category) {
        blog_service.getPostsByCategory(req.query.category).then((data) => {
            res.render("posts", {posts: data, layout: 'main'});
        }).catch((err) =>{
            res.render("posts", {message: "no results", layout: 'main'});
        })
    }else if (req.query.minDate) {
        blog_service.getPostsByMinDate(req.query.minDate).then((data) => {
            res.render("posts", {posts: data, layout: 'main'});
        }).catch((err) =>{
            res.render("posts", {message: "no results", layout: 'main'});
        })
    }else{
        blog_service.getAllPosts().then((data) => {
            res.render("posts", {posts: data, layout: 'main'});
        }).catch((err) =>{
            res.render("posts", {message: "no results", layout: 'main'});
        })
    }
});

app.get("/posts/:val", function(req, res){
    blog_service.getPostsById(req.params.val).then((data) =>{
        res.render("posts", {posts: data, layout: 'main'});
    }).catch((err) =>{
        res.render("posts", {message: "no results", layout: 'main'});
    })
})

app.get("/categories", function(req,res){
    blog_service.getCategories().then((data) => {
        res.render("categories", {categories: data, layout: 'main'});
    }).catch((err) =>{
        res.render("categories", {message: "no results", layout: 'main'});
    })
});




app.post('/posts/add', upload.single("featureImage"), function (req, res) {
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
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blog_service.addPost(req.body).then(() => {
            res.redirect("/posts");
        });


    });
});


app.get("/*", function(req,res){
    res.status(404).render("404", {layout: 'main'})
});


blog_service.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart);
}).catch(() => {
    console.log("Unable to load data");
});




    