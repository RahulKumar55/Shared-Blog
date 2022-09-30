
let HTTP_PORT = process.env.PORT || 8080;
let express = require("express");
let app = express();
let path = require("path");
let data_service = require("./data-service");


function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,"/views/home.html"));
});

app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
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

app.get("/*", function(req,res){
    res.status(404).json({ error: 'Page Not Found' })
});


data_service.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart);
}).catch(() => {
    console.log("Unable to load data");
});
