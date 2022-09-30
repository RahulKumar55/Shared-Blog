let fs = require("fs");

let emp = [];
let dep = [];

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