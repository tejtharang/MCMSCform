
var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/mcmsc");
/*var schema = new mongoose.Schema({

}) */
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");


//Defining database schema
app.post("/addData",function(req,res){
	var myData = req.body;
	console.log(req.body);
	
	res.send("item saved to database");
});

app.get("*",function(req,res){
	res.render("form.ejs");
});

app.listen(3000,"localhost",function(){
	console.log("connected!");
});