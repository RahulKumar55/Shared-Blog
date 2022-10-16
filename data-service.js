let fs = require("fs");

let emp = [];
let dep = [];
let cat = [];
let pos = [];

module.exports.initialize = function(){
    return new Promise((resolve, reject) => {
        try {
            fs.readFile("./data/employees.json", 'utf8',
                (err, data) => {
                    if (err) throw "Employees failed";
                    emp = JSON.parse(data);
                    
                });
            fs.readFile("./data/departments.json", 'utf8',
                (err, data) => {
                    if (err)throw "Departments failed";
                    dep = JSON.parse(data);

                });
                fs.readFile("./data/posts.json", 'utf8',
                (err, data) => {
                    if (err) throw "Posts failed";
                    pos = JSON.parse(data);
                    
                });
            fs.readFile("./data/categories.json", 'utf8',
                (err, data) => {
                    if (err)throw "Categories failed";
                    cat = JSON.parse(data);

                });
        } catch (err) {
            reject("unable to read files.");
        }
        resolve("Read Success");
    })
};

module.exports.getAllEmployees = function(){
    return new Promise((resolve, reject) => {
        if (emp.length === 0) {
            reject("No results returned!");
        }
        resolve(emp);
    });
}

module.exports.getManagers = function () {
    let mang = [];
    return new Promise((resolve, reject) => {
        for (let i = 0; i < emp.length; i++) {
            if (emp[i].isManager) {
                mang[mang.length] = emp[i];
            }
        }
        if (mang.length === 0) {
            reject("No results returned!");
        }
        resolve(mang);
    });
}

module.exports.getDepartments = function () {
    return new Promise((resolve, reject) => {
        if (dep.length === 0) {
            reject("No results returned!");
        }
        resolve(dep);
    });
}


//////////////////////////////////////////////////


module.exports.getAllPosts = function(){
    return new Promise((resolve, reject) => {
        if (pos.length === 0) {
            reject("No results returned!");
        }
        resolve(pos);
    });
}

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        if (cat.length === 0) {
            reject("No results returned!");
        }
        resolve(cat);
    });
}


module.exports.addPost = (postData) => {
    return new Promise((resolve,reject) => {
        postData.published === "undefined" ? postData.published = false : postData.published = true;
        postData.id = pos.length + 1;
        pos.push(postData);
        if (pos.length === 0) {
            reject ('no results');
        }
        else {
            resolve(pos);
        }
    })
};

module.exports.getPostsByCategory = function(category){
    return new Promise((resolve,reject) => {
        var catepos = pos.filter(post => post.category == category);
        if (catepos.length == 0) {
            reject('no results');
        }
        resolve(catepos);
    })
};

module.exports.getPostsByMinDate = function(minDateStr){
    return new Promise((resolve, reject) => {
        var datepos = pos.filter( post => new Date(post.postDate) >= new Date(minDateStr));
        if (datepos.length == 0) {
            reject('no results');
        }
        resolve(datepos);
    })

};


module.exports.getPostsById = function(id){
    return new Promise((resolve,reject) => {
        var catepos = pos.filter(post => post.id == id);
        if (catepos.length == 0) {
            reject('no results');
        }
        resolve(catepos);
    })
};