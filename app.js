var express = require("express");
var app = express();
var session = require("express-session");
var bodyParser = require('body-parser');
var flash = require('connect-flash');
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
  degreeSelect: String,
  graduation: String,
  emailExtra: String,
  firstName: String,
  lastName: String,
  idNumber: String,
  asurite: String,
  programStartDate: String,
  currentSemester: String,
  gpa: String,
  coursesAdd: String,
  courseAddTableHiddenInput: String,
  courseName: String,
  courseGrade: String,
  reasonCourse: String,
  membersAdd: String,
  memberAddTableHiddenInput: String,
  memberName: String,
  memberEmail: String,
  reasonAdvisoryCommittee: String,
  metChair: String,
  reasonNotMetChair: String,
  prospectusDefenseCompleted: String,
  prospectusAnticipatedDateSession: String,
  prospectusAnticipatedDateYear: String,
  mtbiParticipation: String,
  mtbiParticipationYear: String,
  mtbiParticipationRole: String,
  mtbiAnticipatedDateSession: String,
  mtbiAnticipatedDateYear: String,
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
var Student = mongoose.model("Student", schema);
var userSchema = new mongoose.Schema({
  username: String,
  password: String
});
userSchema.methods.validPassword = function (pwd) {
  // EXAMPLE CODE!
  return (this.password === pwd);
};
var User = mongoose.model("User", userSchema);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(session({ secret: 'anything' }));

app.use(flash());
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

app.use(passport.initialize());
app.use(passport.session());


//revalidate when back button is clicked 
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect('/adminLogin');
});

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

//checks if admin pages are all authenticated
function requireLogin(req, res, next) {
  console.log(req.user);
  if (req.user) {
    console.log("hits here");
    next(); // allow the next route to run
  } else {
    console.log("hits here 2");
    // require the user to log in
    res.redirect("/adminLogin"); // or render a form, etc.
  }
}

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/admin/adminView',
    session: true,
    failureRedirect: '/failedAuthentication',
    failureFlash: "Incorrect Username or Password"
  }),
);

app.get('/failedAuthentication', function (req, res) {
  req.flash('message', 'Please check your email to confirm it.');
  req.session.save(function () {
    res.render('adminLogin.ejs');
  });
});
app.get('/adminLogin', function (req, res) {
  res.render("adminLogin.ejs");
})


app.all("/admin/*", requireLogin, function (req, res, next) {

  next(); // if the middleware allowed us to get here,
  // just move on to the next route handler
});
// code for fetching all data from a mongo database
app.get("/admin/adminView", function (req, res) {
  mongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mcmsc");
    dbo.collection("students").find({}).toArray(function (err, result) {
      if (err) throw err;
      for (i = 0; i < result.length; i++) {
        console.log(result[i].firstName);
      }
      console.log("I am here");
      console.log(result);
      app.locals.result = result;
      res.render("adminView.ejs");
      db.close();
    });
  });
})

//director submission
app.post("/admin/directorSubmission", function (req, res) {
  console.log(req.body);
  mongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mcmsc");
    var myquery = { idNumber: req.body.studentId };
    var email = req.body.asurite + "@asu.edu";
    console.log(email);

    var msg = "";
    if (req.body.studentProgressApproval == '1') {
      msg = "Your MCMSC form has been approved by the director";
    }
    else {
      msg = "Your MCMSC form has been rejected by the director.\n" + "Director's comments: " + req.body.directorComment + ".\nPlease schedule an appointment with the director as soon as possible. Thank you"
    }
    var newvalues = { $set: { directorComment: req.body.directorComment, directorApproval: req.body.studentProgressApproval } };
    dbo.collection("students").updateOne(myquery, newvalues, function (err, result) {
      if (err) throw err;
      console.log("1 document updated");
      res.redirect("/admin/adminView");
      var mailOptions = {
        from: 'tharangd95@gmail.com',
        to: email,
        subject: 'MCMSC form submission',
        text: msg
      };
      transporter.sendMail(mailOptions, function (error, info) {
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
app.get("/admin/adminView/:idno", function (req, res) {
  var id = req.params.idno;
  mongoClient.connect(url, function (err, db) {
    console.log("coming here");
    if (err) throw err;
    var dbo = db.db("mcmsc");
    dbo.collection("students").find({ idNumber: id }).toArray(function (err, result) {
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


// Automatically apply the `requireLogin` middleware to all
// routes starting with `/admin`

//Defining database schema
app.post("/addData", function (req, res) {
  var id = req.body.idNumber;
  console.log(id);
  var myData = req.body;
  var myData = new Student(req.body);
  var email = req.body.asurite + '@asu.edu';
  var flag = false;
  if (req.body.memberAddTableHiddenInput != "") {

    flag = true;
    var memberDetails = JSON.parse(req.body.memberAddTableHiddenInput);
  }
  /*  myData.save()
      .then(item => {
        
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
            console.log("t1");
            console.log('Email sent: ' + info.response);
          }
        });
        console.log("t222");
        for(var i = 0;i<memberDetails.length;i++){
          console.log("t333");
        var emailtext = req.body.firstName + " " + req.body.lastName + " has submitted the MCMSC progress form and has listed you as " + memberDetails[i].memberPosition + " of the advisory committee." + "\n ASU ID: " + req.body.idNumber + "\n" + "Asurite : " + req.body.asurite;  
        console.log(emailtext);
        var mailOptions = {
          from: 'tharangd95@gmail.com',
          to : memberDetails[i].memberEmail,
          subject : 'MCMSC form submission',
          text : emailtext
        };
        console.log("email id is :");
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log("t2");
            console.log('Email sent: ' + info.response);
          }
        });
        }
      }) */
  mongoClient.connect(url, function (err, db) {
    console.log("coming here");
    if (err) throw err;
    var dbo = db.db("mcmsc");
    dbo.collection("students").updateMany({ idNumber: id }, {
      $set: {
        degreeSelect: req.body.degreeSelect,
        graduation: req.body.graduation,
        emailExtra: req.body.emailExtra,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        idNumber: req.body.idNumber,
        asurite: req.body.asurite,
        programStartDate: req.body.programStartDate,
        currentSemester: req.body.currentSemester,
        gpa: req.body.gpa,
        coursesAdd: req.body.coursesAdd,
        courseAddTableHiddenInput: req.body.courseAddTableHiddenInput,
        courseName: req.body.courseName,
        courseGrade: req.body.courseGrade,
        reasonCourse: req.body.reasonCourse,
        membersAdd: req.body.membersAdd,
        memberAddTableHiddenInput: req.body.memberAddTableHiddenInput,
        memberName: req.body.memberName,
        memberEmail: req.body.memberEmail,
        reasonAdvisoryCommittee: req.body.reasonAdvisoryCommittee,
        metChair: req.body.metChair,
        reasonNotMetChair: req.body.reasonNotMetChair,
        prospectusDefenseCompleted: req.body.prospectusDefenseCompleted,
        prospectusAnticipatedDateSession: req.body.prospectusAnticipatedDateSession,
        prospectusAnticipatedDateYear: req.body.prospectusAnticipatedDateYear,
        mtbiParticipation: req.body.mtbiParticipation,
        mtbiParticipationYear: req.body.mtbiParticipationYear,
        mtbiParticipationRole: req.body.mtbiParticipationRole,
        mtbiAnticipatedDateSession: req.body.mtbiAnticipatedDateSession,
        mtbiAnticipatedDateYear: req.body.mtbiAnticipatedDateYear,
        publicationsExist: req.body.publicationsExist,
        publicationAddTableHiddenInput: req.body.publicationAddTableHiddenInput,
        publicationName: req.body.publicationName,
        journalName: req.body.journalName,
        publicationUrl: req.body.publicationUrl,
        publicationDoi: req.body.publicationDoi,
        presentationsExist: req.body.presentationsExist,
        presentationAddTableHiddenInput: req.body.presentationAddTableHiddenInput,
        presentationTitle: req.body.presentationTitle,
        presentationForum: req.body.presentationForum,
        otherPresentationType: req.body.otherPresentationType,
        conferencesExist: req.body.conferencesExist,
        conferenceAddTableHiddenInput: req.body.conferenceAddTableHiddenInput,
        conferenceName: req.body.conferenceName,
        awardsExist: req.body.awardsExist,
        awardAddTableHiddenInput: req.body.awardAddTableHiddenInput,
        awardName: req.body.awardName,
        extraInfo: req.body.extraInfo,
        acceptance: req.body.acceptance
      }
    }, { upsert: true, safe: false },
      function (err, data) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("no error");


          //res.send("Thank you for submitting this form! You may now close this window");
          res.render("submissionThanks.ejs");
          var mailOptions = {
            from: 'tharangd95@gmail.com',
            to: email,
            subject: 'MCMSC form submission',
            text: 'Thank you for submitting the form!'
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("t1");
              console.log('Email sent: ' + info.response);
            }
          });
          console.log("t222");
          if (flag)
            for (var i = 0; i < memberDetails.length; i++) {
              console.log("t333");
              var emailtext = req.body.firstName + " " + req.body.lastName + " has submitted the MCMSC progress form and has listed you as " + memberDetails[i].memberPosition + " of the advisory committee." + "\n ASU ID: " + req.body.idNumber + "\n" + "Asurite : " + req.body.asurite;
              console.log(emailtext);
              var mailOptions = {
                from: 'tharangd95@gmail.com',
                to: memberDetails[i].memberEmail,
                subject: 'MCMSC form submission',
                text: emailtext
              };
              console.log("email id is :");
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("t2");
                  console.log('Email sent: ' + info.response);
                }
              });
            }
        }
      });
  });
});
app.get("/form",function(req,res){
  res.render("form.ejs");
});
app.get("*", function (req, res) {
  res.render("initial.ejs");
});

app.listen(3000, "localhost", function () {
  console.log("connected!");
});