var express = require('express');
var SparkPost = require('sparkpost');
var sp = new SparkPost('9bf6b6d7079252cab943971ff90c08cc3a9cee0d');
var port = process.env.PORT || 3000
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs')
var mongodb = require('mongodb')
// var db = mongojs('mongodb://ds143717.mlab.com:43717/shubham', ['users']);
var collections = ["users", "blog", "comments", "property", "images"]

var db = mongojs('mongodb://shubham20.yeole:shubham20.yeole@ds163387.mlab.com:63387/paceteam3', collections)

var app = express();
var ObjectId = mongojs.ObjectId;
var passport = require("passport")
var blog=db.collection('blog');
var session = require('client-sessions');


// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// body parser middleware
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb',extended: false}));

// set static path
// var getRawBody = require('raw-body')
// var typer = require('media-typer')
 
// app.use(function (req, res, next) {
//   getRawBody(req, {
//     length: req.headers['content-length'],
//     limit: '1mb',
//     encoding: typer.parse(req.headers['content-type']).parameters.charset
//   }, function (err, string) {
//     if (err) return next(err)
//     req.text = string
//     next()
//   })
// })
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname)));
app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));
//Global vars
app.use(function(req, res, next){
  res.locals.errors = null;
  next();
})

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
 var errmsg = "Computer Science Project";

// .sort({datefield: -1},
app.get('/', function(req, res){
   db.property.find({ sort: { 'timestamp' : -1 } , limit:11}, function (err, docs) {
    res.render("index.ejs",{property: docs});
  })
});

app.get('/blank', function(req, res){
   res.render("blank.ejs");  
});

app.get('/postadd', function(req, res){
   res.render("postadd.ejs");  
});

app.post('/users/add', function(req, res){


  
  var datetime = new Date();
    var loginstatus = null;
      if(req.session.users==null){
          loginstatus = "false";
        }else{
          loginstatus = "true";
        }
 db.users.findOne({ email: req.body.email }, function(err, users) {
    if (!users) {
          var students = "Shubham is Pace CS student";
        
              var psd = req.body.password;
              if(req.body.password==null){
                psd = "w$9jKp3e$!Zy_Ned";
              }else{
                psd = req.body.password; 
              }
              console.log("success");
              var newUser = {
              fullname: req.body.firstname,
              email: req.body.email,
              phone: req.body.phone,
              date: datetime,
              website: req.body.website,
              password: req.body.password,
              fbid: req.body.email+"w$9jKp3e$!Zy_Ned",
              gender: req.body.gender,
              photo: req.body.photo,
              type: 'user',
            }
        db.users.insert(newUser, function(err, result){
              if(err){
                console.log(err);
              }
        req.session.users = newUser;
        res.redirect('/blog');
  });
  
      
    } else {
        db.users.findOne({ email: req.body.email }, function(err, users) {
          if (!users) {
            errmsg = 'User with email '+req.body.email+' address is not yet registered... Please Sign Up first';
              res.redirect('/');
          } else {
            if (req.body.email+"w$9jKp3e$!Zy_Ned" === users.fbid) {
              // sets a cookie with the user's info
             req.session.users = users;
              res.redirect('/blog');
            } else {
              errmsg = 'Password does not match';
              res.redirect('/');
            }
      }
  });
            
}
});
});

app.get('/users/delete/:id', function(req, res){
  console.log(req.params.id);
  // db.users.remove({_id: ObjectId(req.params.id)}, function(err, result){
      res.send(req.params.id+" Test");
  // });
});

app.get('/users/blog/delete/:id', function(req, res){
  console.log(req.params.id);
  db.blog.remove({_id: ObjectId(req.params.id)}, function(err, result){
      res.send(req.params.id+" Test");
  });
});

app.get('/users/like/:id', function(req, res){
  // console.log(req.params.id);
  var count = 0;
   db.blog.findOne({ _id: ObjectId(req.params.id)}, function (err, blog) {
    console.log(blog.like+" , "+count);
    count = blog.like;
    count++;
     db.blog.update({ _id: ObjectId(req.params.id)}, {$set:{like: count}}, function (err, result) {
       res.send(""+count);

    });
  });
  });
app.get('/users/dislike/:id', function(req, res){
  // console.log(req.params.id);
  var count = 0;
   db.blog.findOne({ _id: ObjectId(req.params.id)}, function (err, blog) {
    console.log(blog.dislike+" , "+count);
    count = blog.dislike;
    count++;
     db.blog.update({ _id: ObjectId(req.params.id)}, {$set:{dislike: count}}, function (err, result) {
       res.send(""+count);  
  });
    });
});

app.get('/blog/getcomment/:id', function(req, res){
    console.log("In get comment method: "+req.params.id);
  db.comments.find({ blogid: req.params.id}, function (err, docs) {
     res.send(docs);
  });
});


app.get('/view/blog/:id', function(req, res){
  console.log(req.params.id);
 var loginstatus = null;
  if(req.session.users==null){
    loginstatus = "false";
  }else{
      loginstatus = "true";
  }
  db.blog.findOne({ _id: ObjectId(req.params.id)}, function (err, blog) {
      res.render("fullblog",{session: loginstatus, blog: blog});
  });
});

app.get('/searching', function(req, res){
  console.log("hello");
 res.send("WHEEE");
});
app.get('/email', function(req, res){
  var loginstatus = null;
  if(req.session.users==null){
    loginstatus = "false";
      }else{
    loginstatus = "true";
  }
   res.render('emailme.ejs',{session: loginstatus});
});

app.get('/ajax/', function(req, res) {
   res.render('ajax.ejs');

});




app.use(function(req, res, next) {
  if (req.session && req.session.users) {
    db.users.findOne({ email: req.session.users.email }, function(err, users) {
      if (users) {
        req.users = users;
        delete req.users.password; // delete the password from the session
        req.session.users = users;  //refresh the session value
        res.locals.users = users;
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
});
function requireLogin (req, res, next) {
  if (!req.users) {
    errmsg = "Please login to use this feature";
    res.redirect('/');
  } else {
    next();
  }
};


app.get('/dashboard', function(req, res) {
  var blogviewmsg = "You are viewing blogs of all category";
  var loginstatus = null;
  if(req.session.users==null){
    loginstatus = "false";
      }else{
    loginstatus = "true";
  }
  db.blog.find(function (err, docs) {
    res.render("dashboard.ejs",{
    blog: docs,
    users: req.session.users,
    message: blogviewmsg,
    session: loginstatus
  });
  } )
});

// app.get('/dashboard', requireLogin, function(req, res) {
//   var blogviewmsg = "You are viewing blogs of all category";
//   db.blog.find(function (err, docs) {
//     res.render("dashboard.ejs",{
//     blog: docs,
//     users: req.session.users,
//     message: blogviewmsg,
//     session: "true"
//   });
//   } )
// });
// client.connect(function () {
 
//     client.upload(['RentalProject/public/css/**'], '/public_html/shubham', {
//         baseDir: 'RentalProject/public',
//         overwrite: 'older'
//     }, function (result) {
//        client.put('RentalProject/public/css/**', '/public_html/shubham', function(err) {
//       if (err) throw err;
//       client.end();
//     });
//         console.log(result);
//     });
// });
app.get('/dashboard/:id', function(req, res) {

  var loginstatus = null;
  if(req.session.users==null){
    loginstatus = "false";
      }else{
    loginstatus = "true";
  }

   var blogviewmsg = "You are viewing blogs of "+req.params.id+" category";
   db.blog.find({ imagename: req.params.id }, function (err, docs) {
    res.render("dashboard2.ejs",{
    blog: docs,
    users: req.session.users,
    message: blogviewmsg,
    session: loginstatus
  });
  } )
});

app.get('/clients/', function(req, res){
  var loginstatus = null;
  
  if(req.session.users==null){
    loginstatus = "false";
  }else{
      loginstatus = "true";
  }
  db.users.find(function (err, docs) {
    res.render("admin.ejs",{
    errmsg : errmsg,
    users: docs,
    session : loginstatus
  });
  } )
  
});
app.get('/logout/', function(req, res) {
  console.log("I am here");

  req.session.reset();
  res.redirect('/dashboard');
});

app.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));
var config = {
    host: 'ftp.byethost7.com',
    port: 21,
    user: 'b8_19205430',
    password: 'Shubham4194'
}
var ftpClient = require('ftp-client'),
client = new ftpClient(config, 'all');
var fs = require("fs");
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var cln = require('ftp');
var c = new cln();
c.on('ready', function() {
    c.list(function(err, list) {
      if (err) throw err;
      console.dir(list);
      c.end();
    });
  });
  // c.connect(config);

// Process upload file
app.post('/file_upload/', upload.single('filename'), function(request, response) {

    var fileName = request.body.filename;
    console.log(fileName);

    var filePath = request.file.path;
    console.log(filePath);

    var file = __dirname + "/uploads/" +  fileName;
    fs.readFile(filePath, function(err, data) {
        fs.writeFile(file, data, function(err) {
            if (err) {
                console.log(err);
            } else {
                responseData = {
                    'message' : 'File uploaded successfully',
                    'fileName' : fileName
                };
            }

        })
    });
     res.redirect('/blog');
});



app.post('/uploadimages', function(req, res) {
  console.log("In upload image 1");
  db.images.update({timestamp: req.body.timestamp},{$set : {"imege1": req.body.image1}},{upsert:true,multi:true}) 
  res.send('Ok'); 
});

app.post('/uploadimages2', function(req, res) {
  console.log("In upload image 2");
  db.images.update({timestamp: req.body.timestamp},{$set : {"imege2": req.body.image2}},{upsert:true,multi:true}) 
  res.send('Ok'); 
});

app.post('/uploadimages3', function(req, res) {
  console.log("In upload image 3");
  db.images.update({timestamp: req.body.timestamp},{$set : {"imege3": req.body.image3}},{upsert:true,multi:true}) 
  res.send('Ok'); 
});

app.post('/uploadimages4', function(req, res) {
  console.log("In upload image 4");
  db.images.update({timestamp: req.body.timestamp},{$set : {"imege4": req.body.image4}},{upsert:true,multi:true}) 
  res.send('Ok'); 
});

app.get('/showimages', function(req, res) {
   db.images.find(function (err, docs) {
    res.render("showimages.ejs",{images: docs});
  })
});
 

app.post('/postproperty/', function(req, res){
    var datetime = new Date();
    console.log(datetime);
        var newProperty = {
          phone: req.body.phone,
          email: req.body.email,
          telephone: req.body.telephone,
          staddress: req.body.staddress,
          timestamp: req.body.timestamp,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zip,
          county: req.body.county,
          country: req.body.country,
          bedroom: req.body.bedroom,
          kitchen: req.body.kitchen,
          bathroom: req.body.bathroom,
          propertytype: req.body.propertytype,
          area: req.body.area,
          dateField: datetime,
          image1: req.body.image1,
          posttime: req.body.posttime,
          discription: req.body.discription,
          posted_date: req.body.blogdata
        }
        db.property.insert(newProperty, function(err, result){
        
          if(err){
            console.log(err);
          }
      });

      res.redirect('/postadd');

});
app.post('/view/blog/comment', function(req, res){

    var newComment = {
      comment: req.body.comment,
      fullname: req.body.fullname,
      blogid: req.body.blogid,
      long: req.body.long,
      lat: req.body.lat,
      date: req.body.date
    }
    db.comments.insert(newComment, function(err, result){
      if(err){
        console.log(err);
      }
    res.send("Done");
  });
});


app.get('/registerlogin', function(req, res){

   res.render("signupin.ejs");
 
});

app.get('/blog/', function(req, res) {

  var loginstatus = null;
  if(req.session.users==null){
    loginstatus = "false";
  }else{
      loginstatus = "true";
  }
 res.render('blog',{session : loginstatus, users: req.session.users});
 });

app.get('/googlemap/', function(req, res) {

    res.render('googlemap',{session : "true",users: req.session.users});
     
  
});

app.post('/login', function(req, res) {
  db.users.findOne({ email: req.body.email }, function(err, users) {
    if (!users) {
      errmsg = 'Email not registered...'; 
        res.redirect('/');
    } else {
      if (req.body.password === users.password) {
        // sets a cookie with the user's info
        req.session.users = users;
        res.redirect('/blog');
      } else {
        errmsg = 'Incorrect Password...';
        res.redirect('/');
      }
    }
  });
});

var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport")

var smtpTransport = nodemailer.createTransport(smtpTransport({
    host : "smtp.sendgrid.net.",
    secureConnection : false,
    port: 587,
    auth : {
        user : "shubham20.yeole@gmail.com",
        pass : "password"
    }
}));
app.post('/send',function(req,res){
  var message = req.body.message;
  var email = req.body.email;
  var long = req.body.long;
  var lat = req.body.lat;
  var signature = "Thank you,<br>Shubham Yeole,<br>Full Stack Developer,<br>Phone: +1(201) 887-5323<br>";
  var text1 = "Hello "+email+"<br>";
  var text2 = "Thank you for contacting me. I appreciate your time for reviewing my blog<br><br>";
  var text3 = "My name is Shubham Yeole. I am full stack developer from Pace University Computer Sciece major and I am actively seeking full time opprtunity in software development position. I have successfully received your email on shubham20.yeole@gmail.com and will reply you back as soon as possible";
  var result = text1 + " "+text2+" "+text3;
  var emailBody = '<div><div style="background-color: #3B2F63; color: #b0abc0; padding-top: 5%; padding-left: 2%; padding-right: 2%; padding-bottom: 2%; font-size: 1.5em;">Check out my profile on <div style="color: #d7d5df; font-size: 1.5em;"><br><a style="color: #d7d5df;" href="https://www.linkedin.com/in/shubhamyeole">LinkedIn</a><br><a style="color: #d7d5df;" href="https://www.facebook.com/sy06736n">Facebook</a><br><a style="color: #d7d5df;" href="http://stackoverflow.com/users/5451749/shubham-yeole">StackOverflow</a><br><a style="color: #d7d5df;" href="https://github.com/shubham20yeole">GitHub</a></div><br><br><div style="padding: 3%; background-color: #d7d5df; color: #3B2F63;">'+result+'<br><br></div><p style="font-weight: bold;">'+signature+'</p><br><br><div style="padding: 2%; background-color: white; color: black;">&copy; 2016 java-nodejs-blog.herokuapp.com. All Rights Reserved, Whatever That Means.</div></div></div>';
  var subject = "Thank you for viewing my Java-NodeJS-Blog"; 
      var mailOptions={
        from : "shubham20.yeole@gmail.com",
        to : email,
        subject : subject,
        text : "Your Text",
        html : emailBody,
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            res.end("error");
        }else{
            console.log(response.response.toString());
            console.log("Message sent: " + response.message);
            res.end("sent");
        }
    });


      var mailOptions1={
        from : "shubham20.yeole@gmail.com",
        to : "shubham20.yeole@gmail.com",
        subject : email+" emaild you from your blog website",
        text : "Your Text",
        html : "Email sent from "+email+"<br><br><b>"+message+"</b><br><br>Emailed from Longitude: "+long+" , Latitude: "+lat,
    }
    console.log(mailOptions1);
    smtpTransport.sendMail(mailOptions1, function(error, response){
        if(error){
            console.log(error);
            res.end("error");
        }else{
            console.log(response.response.toString());
            console.log("Message sent: " + response.message);
            res.end("sent");
        }
    });
});

app.listen(port, function() {
  console.log('Listening on port ' + port)
})