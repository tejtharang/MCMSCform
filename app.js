
var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var options = {
  "auth": {
      "authSource": "admin"
  },
  "user": "admin",
  "pass": "admin123"
};

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/mcmsc",options);
var schema = new mongoose.Schema({
	degreeSelect : String,
	mastersInPassing : String,
	graduation : String,
	emailExtra : String,
	firstName : String,
	lastName : String,
	idNumber : String,
	asurite : String,
	programStartDate : String,
	currentSemester : String,
	gpa : String,
	coursesAdd : String,
	courseAddTableHiddenInput : String,
	courseName : String,
	courseGrade : String,
	reasonCourse : String,
	membersAdd : String,
	memberAddTableHiddenInput : String,
	memberName : String,
	memberEmail : String,
	reasonAdvisoryCommittee : String,
	metChair: String,
  	reasonNotMetChair: String,
  	prospectusDefenseCompleted: String,
  mtbiParticipation: String,
  mtbiParticipationYear: String,
  mtbiParticipationRole: String,
  publicationsExist: String,
  publicationAddTableHiddenInput: String,
  publicationName: String,
  journalName: String,
  publicationUrl: String,
  publicationDoi: String,
  presentationsExist: String,
  presentationAddTableHiddenInput: String,
  presentationTitle: String,
  presentationForum: String,
  otherPresentationType: String,
  conferencesExist: String,
  conferenceAddTableHiddenInput: String,
  conferenceName: String,
  awardsExist: String,
  awardAddTableHiddenInput: String,
  awardName: String,
  extraInfo: String,
  acceptance: String
});
var Student = mongoose.model("Student",schema);
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");


//Defining database schema
app.post("/addData",function(req,res){
	var myData = req.body;
	console.log(req.body);
	var myData = new Student(req.body);
    myData.save()
      .then(item => {
        console.log("hello there");
        res.send("item saved to database");
      })
      .catch(err => {
        res.status(400).send("unable to save to database");
      });
});

app.get("*",function(req,res){
	res.render("form.ejs");
});

app.listen(3000,"localhost",function(){
	console.log("connected!");
});