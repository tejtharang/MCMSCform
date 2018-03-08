var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var mongoClient = require("mongodb").MongoClient;
mongoose.Promise = global.Promise;
var url = "mongodb://localhost:27017/mcmsc";
mongoose.connect("mongodb://localhost:27017/mcmsc");
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

// individual student data from adminView
app.get("/adminView/:idno",function(req,res){
  var id = req.params.idno;
  mongoClient.connect(url,function(err,db){
    console.log("coming here");
    if (err) throw err;
    var dbo = db.db("mcmsc");
    dbo.collection("students").find({idNumber : id}).toArray(function(err,result){
      if (err) throw err;
      app.locals.result = result;
      //console.log(result[0]);
      //var st = JSON.parse(result[0].courseAddTableHiddenInput);
      //console.log(st);
      res.render("adminViewEachStudent.ejs");
      db.close();
    });
  });
});

// code for fetching all data from a mongo database
app.get("/adminView",function(req,res){
  mongoClient.connect(url,function(err,db){
    if (err) throw err;
    var dbo = db.db("mcmsc");
    dbo.collection("students").find({}).toArray(function(err,result){
      if (err) throw err;
      for(i=0;i<result.length;i++){
        console.log(result[i].firstName);
      }
      app.locals.result = result;
      res.render("adminView.ejs");
      db.close();
    });
  });
})


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
    Student.find({},function(err,students){
      if(err){
        console.log(err);
      }
      else{
        console.log("123");
        console.log(students);
      }
    });
});

app.get("*",function(req,res){
	res.render("form.ejs");
});

app.listen(3000,"localhost",function(){
	console.log("connected!");
});