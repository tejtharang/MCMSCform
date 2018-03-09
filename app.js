var express = require("express");
var app = express();
var bodyParser = require('body-parser');
// setting up node email
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'tharangd95@gmail.com',
    pass: 'tanicky9596'
  }
});
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
  prospectusAnticipatedDateSession: String,
  prospectusAnticipatedDateYear: String,
  mtbiParticipation: String,
  mtbiParticipationYear: String,
  mtbiParticipationRole: String,
  mtbiAnticipatedDateSession: String,
  mtbiAnticipatedDateYear:String,
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

//director submission
app.post("/directorSubmission",function(req,res){
  console.log(req.body);
  mongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mcmsc");
    var myquery = { idNumber : req.body.studentId };
    var email = req.body.asurite + "@asu.edu";
    console.log(email);
    
    var msg = "";
    if(req.body.studentProgressApproval == '1')
    {
      msg = "Your MCMSC form has been approved by the director";
    }
    else{
      msg = "Your MCMSC form has been rejected by the director.\n" + "Director's comments: " + req.body.directorComment  + ".\nPlease schedule an appointment with the director as soon as possible. Thank you"
    }
    var newvalues = { $set: {directorComment : req.body.directorComment, directorApproval: req.body.studentProgressApproval } };
    dbo.collection("students").updateOne(myquery, newvalues, function(err, result) {
      if (err) throw err;
      console.log("1 document updated");
      res.redirect("/adminView");
      var mailOptions = {
        from: 'tharangd95@gmail.com',
        to: email,
        subject: 'MCMSC form submission',
        text: msg
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      db.close();
    });
   
  });
  
});
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
      console.log(result[0]);
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
  var email = req.body.asurite + '@asu.edu';
    myData.save()
      .then(item => {
        console.log(req.body);
        //res.send("Thank you for submitting this form! You may now close this window");
        res.render("submissionThanks.ejs");
        var mailOptions = {
          from: 'tharangd95@gmail.com',
          to: email,
          subject: 'MCMSC form submission',
          text: 'Thank you for submitting the form!'
        };
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
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