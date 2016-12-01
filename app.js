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
var JSFtp = require("jsftp");

var Ftp = new JSFtp({
    host: 'ftp.byethost7.com',
    port: 21,
    user: 'b8_19205430',
    password: 'Shubham4194'
});
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

var fs = require('fs');
var S3FS = require('s3fs');
// var s3fsImpl = new S3FS('shubhambucket123', {
//   accessKeyId:'AKIAJ654LHXUQ5QYDGCQ',
//   secretAccessKey:'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'
// });

// s3fsImpl.create();
 
var multiparty = require('connect-multiparty'),
  multipartyMiddleware = multiparty();
app.use(multipartyMiddleware);
    app.use(function(req, res, next){
      fs.appendFile('logs.txt', req.path + "token:" + req.query.access_token+'', 
        function(err){
          next();
        });
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
    var users = {
              fullname: 'Anonymous',
              email: 'N/A',
              phone: 'N/A',
              date: 'N/A',
              website: 'N/A',
              password: 'N/A',
              fbid: 'N/A',
              gender: 'N/A',
              photo: 'N/A',
              type: 'N/A',
            }
      res.locals.users = users;

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


// .sort({datefield: -1},
app.get('/', function(req, res){       
  db.property.find({}).skip(0).sort({timestamp: -1}).limit(9).toArray(function (err, docs) {
    res.render("index.ejs",{property: docs});
  })
});
app.get('/contact', function(req, res){       
    res.render("contact.ejs");
});

app.get('/properties/:id', function(req, res){  
var pageno = Number(req.params.id);  
  db.property.find({}).skip(pageno*6).sort({timestamp: -1}).limit(6).toArray(function (err, docs) {
    db.property.count(function(err, count) {
      var status = 'Showing '+(pageno*6+1)+' to '+(pageno*6+6)+' of '+count+' Properties';
      console.log(status);  
     db.property.find({}).skip(0).sort({timestamp: -1}).limit(5).toArray(function (err, latestproperty) {
    res.render("properties.ejs",{property: docs, count: count, pageno: pageno+1, status: status, latestproperty: latestproperty});
    })    
    })
  })
});
app.get('/gallery/:id', function(req, res){  
var pageno = Number(req.params.id);  
  db.property.find({}).skip(pageno*6).sort({timestamp: -1}).limit(6).toArray(function (err, docs) {
    db.property.count(function(err, count) {
      var status = 'Showing '+(pageno*6+1)+' to '+(pageno*6+6)+' of '+count+' Properties';
      console.log(status);  
      res.render("gallery.ejs",{property: docs, count: count, pageno: pageno+1, status: status});
    })
  })
});
app.get('/propertiesbymaps', function(req, res){  
var pageno = Number(0);  
  db.property.find({}).skip(pageno*6).sort({timestamp: -1}).limit(100).toArray(function (err, docs) {
    db.property.count(function(err, count) {
      var status = 'Showing '+(pageno*6+1)+' to '+(pageno*6+6)+' of '+count+' Properties';
      console.log(status);  
      res.render("propertiesbymaps.ejs",{property: docs, count: count, pageno: pageno+1, status: status});
    })
  })
});
app.get('/blank', function(req, res){
   res.render("blank.ejs");  
});

app.get('/postadd', function(req, res){
  var property = "";
  res.render("postadd.ejs",{property});  
});

app.post('/loginwithfacebook', function(req, res){
  
  // if users exist update session
  // else add user update session

 db.users.findOne({ email: req.body.email }, function(err, users) {
    if (!users) {
       
        var users = {
              fullname: req.body.firstname,
              email: req.body.email,
              phone: 'N/A',
              date: 'N/A',
              website: 'N/A',
              password: 'N/A',
              fbid: 'N/A',
              gender: 'N/A',
              photo: req.body.photo,
              type: 'N/A',
            }
        res.locals.users = users;
        req.session.users = users;
        res.render("message.ejs",{property: "REGISTERED", status: 'registered', message: 'Congratulations. Your are successfully Logged in using facebook...', link: '<a href="/propertiesbymaps">Click me to view our properties by google map...</a>'});
        
     } else {
        req.session.users = users;
        res.render("message.ejs",{property: "REGISTERED", status: 'registered', message: 'Congratulations. Your are successfully Logged in using facebook...', link: '<a href="/propertiesbymaps">Click me to view our properties by google map...</a>'});
      }
  });
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
              var file = req.files.file;
              console.log("File: "+file+", File Path: "+file.path+", originalFilename: "+file.originalFilename);
              Ftp.auth('b8_19205430', 'Shubham4194', function(err, list) {
                console.log("Hello World: "+err);
                Ftp.put(file.path, 'htdocs/public_html/'+req.body.photoname, function(err2) {
                    if (err) console.log("Put Method: "+err2);
                  });
              });
              // var stream = fs.createReadStream(file.path);
              // return s3fsImpl.writeFile(req.body.photoname, stream).then(function(){
              //   fs.unlink(file.path, function(err){
              //     if(err) console.log(err);
              //   })
              var photoUrl = 'http://shubhamyeole.byethost8.com/public_html/'+req.body.photoname;
              console.log(photoUrl);
              var newUser = {
              fullname: req.body.firstname,
              email: req.body.email,
              phone: req.body.phone,
              date: datetime,
              website: req.body.website,
              password: req.body.password,
              fbid: req.body.email+"w$9jKp3e$!Zy_Ned",
              gender: req.body.gender,
              photo: photoUrl,
              type: 'user',
            }
        db.users.insert(newUser, function(err, result){
              if(err){
                console.log(err);
              }
        req.session.users = newUser;
        res.render("message.ejs",{property: "REGISTERED", status: 'registered', message: 'Congratulations. Your are successfully registered...', link: '<a href="/propertiesbymaps">Click me to view our properties by google map...</a>'});
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
              var url = req.body.preurl;
              res.redirect(url);
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
  res.redirect('/');
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


app.post('/file_upload', function(req, res){
  var file = req.files.file;

    console.log("File: "+file+", File Path: "+file.path+", originalFilename: "+file.originalFilename);
  Ftp.auth('b8_19205430', 'Shubham4194', function(err, list) {
  console.log("Hello World: "+err);
  Ftp.put(file.path, 'htdocs/public_html/fileupload.jpg', function(err2) {
      if (err) console.log("Put Method: "+err2);
    });
});


res.send("DONE");

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

app.post('/search', function(req, res) {
  var loc = req.body.location;
  console.log(loc);
   db.property.find({ city: {'$regex': loc} }, function (err, property) {
    res.send(property);
  });
   
});

app.post('/searchproperty', function(req, res) {
  var timestamp = req.body.timestamp;
  console.log(timestamp);
   db.property.findOne({ timestamp: timestamp}, function (err, property) {
    res.send(property);
  });
});


app.get('/detailedproperty/:id', function(req, res){
    console.log("In get comment method: "+req.params.id);
 
  db.property.findOne({ timestamp: req.params.id}, function (err, property) {
  db.property.find({}).skip(0).sort({timestamp: -1}).limit(5).toArray(function (err, latestproperty) {
    res.render("detailedproperty.ejs",{property: property, latestproperty: latestproperty});
    })      
  });
});

app.get('/message', function(req, res){
  res.render("message.ejs",{status: 'addpost', message: 'Congratulations. Your add is posted successfully...', link: '<a href="/detailedproperty/">Click me to view your post</a>'});
});
app.get('/workinprogress', function(req, res){
  res.render("message.ejs",{status: 'd', message: 'WORK IN PROGRESS. Sorry for any inconvenience caused', link: '<a href="/detailedproperty/">Click me to view your post</a>'});
});
app.post('/postproperty/', function(req, res){
    var datetime = new Date();
      var file = req.files.propertyfile;
      var filename = req.body.filename;
      var filelinks = req.body.filelinks;
      var propertyphoto = "";
      var allphoto = "";
     Ftp.auth('b8_19205430', 'Shubham4194', function(err, list) {
        console.log("Hello World: "+err);
        Ftp.put(file.path, 'htdocs/public_html/property/'+filename, function(err2) {
            if (err) console.log("Put Method: "+err2);
          });
      });
      // Ftp.auth('b8_19205430', 'Shubham4194', function(err, list) {
      //             console.log("Hello World: "+err);
      // });
      // for(i=0; i<=file.length; i++){
      //   var filepath = file[i].path;
      //   propertyphoto = filelinks[0];
      //   allphoto = allphoto + filelinks[i]+" ";
      //   console.log("filename[i]: "+filename[i]+","+filepath+"File: "+file[i]+", File Path: "+file[i].path+", originalFilename: "+file[i].originalFilename);
      //       Ftp.put(''+filepath+'', 'htdocs/public_html/'+filename[i], function(err2) {
      //           if (err) console.log("Put Method: "+err2);
      //           });
      // }
      console.log("propertyphoto: "+propertyphoto+", allphoto: "+allphoto);
      console.log(req.body.propertyfeatures);
        var newProperty = {
          title: req.body.title,
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
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          bedroom: req.body.bedroom,
          kitchen: req.body.kitchen,
          bathroom: req.body.bathroom,
          addtype: req.body.addtype,
          propertytype: req.body.propertytype,
          features: req.body.propertyfeatures,
          area: req.body.area,
          cost: req.body.cost,
          dateField: datetime,
          discription: req.body.discription,
          posted_date: req.body.blogdata,
          image1: filelinks,
          images: filelinks
       }
       
        db.property.insert(newProperty, function(err, result){
        
          if(err){
            console.log(err);
          }else{
            res.render("message.ejs",{status: 'addpost', message: 'Congratulations. Your add is posted successfully...', link: '<a href="/detailedproperty/'+result.timestamp+'">Click me to view your post</a>'});
          }
      });

      

});
app.post('/postproperty22/', function(req, res){
    var datetime = new Date();
      var file = req.files.file;
      var filename = req.body.filename;
      var filelinks = req.body.filelinks;
      var propertyphoto = "";
      var allphoto = "";
      // for(i=0; i<file.length; i++){
      //   propertyphoto = filelinks[0];
      //   allphoto = allphoto + filelinks[i]+" ";
      //   console.log("File: "+file[i]+", File Path: "+file[i].path+", originalFilename: "+file[i].originalFilename);
      //   var stream = fs.createReadStream(file[i].path);
      //   s3fsImpl.writeFile(filename[i], stream).then(function(){
      //   fs.unlink(file[i].path, function(err){
      //     if(err) console.log(err);
      //   })
      // })
      // }
      console.log("propertyphoto: "+propertyphoto+", allphoto: "+allphoto);
      console.log(req.body.propertyfeatures);
        var newProperty = {
          title: req.body.title,
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
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          bedroom: req.body.bedroom,
          kitchen: req.body.kitchen,
          bathroom: req.body.bathroom,
          addtype: req.body.addtype,
          propertytype: req.body.propertytype,
          features: req.body.propertyfeatures,
          area: req.body.area,
          cost: req.body.cost,
          dateField: datetime,
          discription: req.body.discription,
          posted_date: req.body.blogdata,
          image1: propertyphoto,
          images: allphoto
       }
       
        db.property.insert(newProperty, function(err, result){
        
          if(err){
            console.log(err);
          }else{
            res.redirect('/detailedproperty/'+result.timestamp);
          }
      });

      

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

   res.render("signupin.ejs", {errmsg: ""});
 
});




app.post('/login', function(req, res) {
  db.users.findOne({ email: req.body.email }, function(err, users) {
    if (!users) {
      console.log(req.body.email);
      errmsg = 'Email not registered... Please try again or Signup to use our services. Thank you.'; 
         res.render("signupin.ejs", {errmsg: errmsg});
    } else {
      if (req.body.password === users.password) {
        // sets a cookie with the user's info
        req.session.users = users;
        var url = req.body.preurl;
        res.redirect(url);
      } else {
        errmsg = 'Incorrect Password... RESET new Password or login with facebook to use our services';
         res.render("signupin.ejs", {errmsg: errmsg});
      }
    }
  });
});
 // db.users.remove({_id: ObjectId(req.params.id)}, function(err, result){
      // res.send(req.params.id+" Test");
  // });
app.post('/detailedproperty/sendinterestinproperty', function(req, res){
  console.log("In newpasswordupdate method: "+req.body.email);
  var name = req.body.name;
  var emailofposter = req.body.emailofposter;
  var email = req.body.email;
  var dateodmovein = req.body.dateodmovein;
  var timestamp = req.body.timestamp;
  var propertyaddress = req.body.propertyaddress;
  
  var description = req.body.personaldiscription;
  var title = name+" is interested in your property at USA REAL ESTATES";
  var message = "<br><br><span style='color: #4f4e56;'>"+name+"</span> can move in from: <span style='color: #4f4e56;'>"+dateodmovein+"</span><br><br>Moreover, "+name+" also left a message for you. Here it is: <br><br><span style='color: #4f4e56;'>"+description+"</span><br><br>You can reach back to <span style='color: #4f4e56;'>"+name+"</span> at <span style='color: #4f4e56;'>"+email+"</span> email address <br><br>Thank you for using our service.<br><br>";
  var subject = name+" is interested in your property at USA REAL ESTATES";

  var description1 = req.body.personaldiscription;
  var title1 = "Confirmation of your interest";
  var message1 = "<br><br>It looks like you have shown interest in <span style='color: #4f4e56;'>"+propertyaddress+"</span> and we have successfully sent your thoughts to owner of mentioned property. You will here back soon if property owner is statisfied with your mentioned Quote<br><br>Thank you for using our service. ";
  var subject1 = "USA REAL ESTATES sent your message to property owner";

  sendEmail(emailofposter, title, message, subject);
  sendEmail(email, title1, message1, subject1);
db.property.findOne({ timestamp: timestamp}, function (err, property) {
  db.property.find({}).skip(0).sort({timestamp: -1}).limit(5).toArray(function (err, latestproperty) {
    res.render("detailedproperty.ejs",{property: property, latestproperty: latestproperty});
    })      
  });
});
app.get('/newpassword/:id', function(req, res){
    console.log("In get comment method: "+req.params.id);
  db.users.findOne({_id: ObjectId(req.params.id)}, function (err, users) {
 console.log(users);
    res.render("setnewpassword.ejs",{users: users});
      }); 

});
app.post('/newpasswordupdate', function(req, res){
    console.log("In newpasswordupdate method: "+req.body.email);
  db.users.update({ email: req.body.email}, {$set:{password: req.body.passcode}}, function (err, result) {
      // sendEmail(req.body.email, "Password Reset", "We received a request to reset the password for your account. If you requested a reset for "+email+", click the button below. <br><br><a href='https://usa-real-estates.herokuapp.com/newpassword/"+users._id+"' target='_blank'>SET NEW PASSWORD</a><br><br>e this email.Please click on Use temporary password as temppassword","Password reset on USA REAL ESTATES");
      res.render("signupin.ejs", {errmsg: "Password successfully Reset."});
    });
});

app.post('/resetpassword', function(req, res) {
    var email = req.body.email;
     db.users.findOne({ email: req.body.email }, function(err, users) {
    if (!users) {
      errmsg = 'Email not registered...'; 
      res.render("signupin.ejs", {errmsg: errmsg});
    } else {
      db.users.update({ email: req.body.email}, {$set:{password: "temppassword"}}, function (err, result) {
      sendEmail(email, "Password Reset", "<br>We received a request to reset the password for your account.<br> If you requested a reset for "+email+", <br>click the button below. <br><br><a style='padding: 1%; background-color: #6a67ce; color: #e1e0f5;' href='https://usa-real-estates.herokuapp.com/newpassword/"+users._id+"' target='_blank'>SET NEW PASSWORD</a><br><br>e this email.Please click on Use temporary password as temppassword","Password reset on USA REAL ESTATES");
      res.render("signupin.ejs", {errmsg: "Temporary password has been sent to "+email+". Please check your email to reset new password."});
    });
    }
  });
});

var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport")

var smtpTransport = nodemailer.createTransport(smtpTransport({
    host : "smtp.sendgrid.net",
    secureConnection : false,
    port: 587,
    auth : {
        user : "shubham20.yeole@gmail.com",
        pass : "Shubham4194"
    }
}));
function sendEmail(email, title, message, subject){
var emailBody = '<div style="padding: 2%; text-align: center; background-color: #efefef"><div style="padding: 2%; text-align: center; background-color: #fcfcfc"><h1 style="color: #606060">WELCOME TO USA REAL ESTATES</h1><img src="http://shubhamyeole.byethost8.com/public_html/logo.jpg" width="150" height="150"><h2>[TITLE]</h2><h5>[MESSAGE]</h5><h6>[SIGNATURE]</h6><hr><h6 style="color: #808080">You are getting this email because you have signed up for emails update.</h6><h6 style="color: #808080">For more information visit our website at <a style="color: #808080" href="https://usa-real-estates.herokuapp.com/">USA REAL ESTATES</a></h6></div></div>';
emailBody = emailBody.replace("[TITLE]", title);
emailBody = emailBody.replace("[MESSAGE]", "Hello "+email+"<br><br>"+message);
emailBody = emailBody.replace("[SIGNATURE]", 'By Shubham Yeole');

 var mailOptions={
        from : "shubham20.yeole@gmail.com",
        to : email,
        subject : subject,
        text : "Your Text",
        html : emailBody,
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
       
    });
}
app.get('/send',function(req,res){
  var message = "hello shubham";
  var email = "shubham20.yeole@gmail.com";
  var long = "rr";
  var lat = "rr";
  var signature = "Thank you,<br>Shubham Yeole,<br>Full Stack Developer,<br>Phone: +1(201) 887-5323<br>";
  var text1 = "Hello "+email+"<br>";
  var text2 = "Thank you for contacting me. I appreciate your time for reviewing my blog<br><br>";
  var text3 = "My name is Shubham Yeole. I am full stack developer from Pace University Computer Sciece major and I am actively seeking full time opprtunity in software development position. I have successfully received your email on shubham20.yeole@gmail.com and will reply you back as soon as possible";
  var result = text1 + " "+text2+" "+text3;
  var emailBody = '<div><div style="background-color: #3B2F63; color: #b0abc0; padding-top: 5%; padding-left: 2%; padding-right: 2%; padding-bottom: 2%; font-size: 1.5em;">Thank you for vising our website.<div style="color: #d7d5df; font-size: 1.5em;"><br><a style="color: #d7d5df;" href="https://www.linkedin.com/in/shubhamyeole">LinkedIn</a><br><a style="color: #d7d5df;" href="https://www.facebook.com/sy06736n">Facebook</a><br><a style="color: #d7d5df;" href="http://stackoverflow.com/users/5451749/shubham-yeole">StackOverflow</a><br><a style="color: #d7d5df;" href="https://github.com/shubham20yeole">GitHub</a></div><br><br><div style="padding: 3%; background-color: #d7d5df; color: #3B2F63;">'+result+'<br><br></div><span style="font-weight: bold;">'+signature+'</span><br><br><div style="padding: 2%; background-color: white; color: black;">&copy; 2016 usa-real-estates.herokuapp.com. All Rights Reserved.</div></div></div>';
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
});

app.post('/testUpload', function(req, res){
  var file = req.files.file;

    console.log("File: "+file+", File Path: "+file.path+", originalFilename: "+file.originalFilename);
    fs.readFile(file.path, function (err, data) {
      // ...
      var newPath = 'C:/Users/20188/Desktop/FolderTest';
      fs.writeFile(newPath, data, function (err) {
          if(err){
            res.send("Error"+err);
          }
          else{
            res.send("Done");
          }
      });
})})

app.get('/testAPI', function(req, res){
  res.json({SecretData: 'abc123'});
});


