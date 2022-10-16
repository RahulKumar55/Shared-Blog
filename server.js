/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Rahul Kumar Student ID: 157197211 Date: 10\14\2022
*
*  Online (Heroku) Link: https://mysterious-brook-32823.herokuapp.com/
*
********************************************************************************/ 



let HTTP_PORT = process.env.PORT || 8080;
let express = require("express");
let app = express();
let path = require("path");
let data_service = require("./data-service");

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




function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('./public/site.css'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,"/views/home.html"));
});



app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/posts/add", function(req,res){
    res.sendFile(path.join(__dirname,"/views/addPost.html"));
    
});

app.get("/departments", function(req,res){
    data_service.getDepartments().then((data) =>{
        res.json(data);
    }).catch((err)=>{
        res.json({ error: err });
    })
});

app.get("/employees", function(req,res){
    data_service.getAllEmployees().then((data) => {
        res.json(data);
    }).catch((err) =>{
        res.json({ error: err })
    })
});


app.get("/managers", function(req,res){
    data_service.getManagers().then((data) =>{
        res.json(data);
    }).catch((err) =>{
        res.json({ error: err })
    })
});

app.get("/posts", function(req,res){
    if (req.query.category) {
        data_service.getPostsByCategory(req.query.category).then((data) => {
            res.json(data);
        }).catch((err) =>{
            res.json({ error: err })
        })
    }else if (req.query.minDate) {
        data_service.getPostsByMinDate(req.query.minDate).then((data) => {
            res.json(data);
        }).catch((err) =>{
            res.json({ error: err })
        })
    }else{
        data_service.getAllPosts().then((data) => {
            res.json(data);
        }).catch((err) =>{
            res.json({ error: err })
        })
    }
});

app.get("/posts/:val", function(req, res){
    data_service.getPostsById(req.params.val).then((data) =>{
        res.json(data);
    }).catch((err) =>{
        res.json({ error: err })
    })
})

app.get("/categories", function(req,res){
    data_service.getCategories().then((data) => {
        res.json(data);
    }).catch((err) =>{
        res.json({ error: err })
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
        data_service.addPost(req.body).then(() => {
            res.redirect("/posts");
        });


    });
});


app.get("/*", function(req,res){
    res.status(404).json({ error: 'Page Not Found' })
});


data_service.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart);
}).catch(() => {
    console.log("Unable to load data");
});
