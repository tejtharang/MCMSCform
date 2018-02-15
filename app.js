
var express = require("express");
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");
// Database connection
var mongoose = require("mongoose");
options = {
    "auth": {
        "authSource": "admin"
    },
    "user": "admin",
    "pass": "admin123"
};
mongoose.connect("mongodb://localhost/cat_app",options);

//Defining database schema
var nameSchema = new mongoose.Schema({
	firstName: String,
	lastName: String
});

var user = mongoose.model("user",nameSchema);

app.post("/addData",function(req,res){
	console.log("reached add data");
	var myData = new user(req.body);
	myData.save().then(item => {
		res.send("item saved to database");
	})
	.catch(err => {
		res.status(400).send("unable to save to database");
	});
});

app.get("*",function(req,res){
	res.render("form.ejs");
});

app.listen(3000,"localhost");