var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

//accessing bodyparser middleware and allowing the POST request
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//accessing cookie parser middleware and allowing to save cookie
var cookieParser = require('cookie-parser');
app.use(cookieParser());

//database
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

var users = {
  "hannah": {
    id: "hannah",
    email: "hannah@hannah.com",
    password: "hannah"
  },
 "grace": {
    id: "grace",
    email: "grace@grace.com",
    password: "grace"
  },
  "jenna": {
    id: "jenna",
    email: "jenna@jenna.com",
    password: "jenna"
  },
  "lisa": {
    id: "lisa",
    email: "lisa@lisa.com",
    password: "lisa"
  }
}



//handling get request
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

//show the jSON version of urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});





//show the list of URLs with their shortened forms
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urlDatabase: urlDatabase
  }
  // console.log(userLoggedIn.username)
  res.render("urls_index", templateVars);
});

// //show the list of URLs with their shortened forms
// app.get("/THIS_IS_NOT_REAL/urls", (req, res) => {
//   var user = {
//     name: "idiot",
//     profile_pic: "http://pics.com/mypic.jpg"
//   }
//   // TODO: set user to the right user, somehow

//   // console.log(userLoggedIn.username)
//   res.render("urls_index", {
//     urlDatabase: urlDatabase,
//     userLoggedIn: user
//   });
// });


//Generate a Random ShortURL
function generateRandomString() {
  var result = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    result += possible.charAt(Math.floor(Math.random() * possible.length));

  return result;
}


//show /urls/new page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});


//add new URLs
app.post("/urls", (req, res) => {
  const newURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = newURL;
  console.log("urlDatabase: ", urlDatabase);  // debug statement to see POST parameters
  res.redirect("/urls/" + shortURL);         // redirecting to the page where it shows the individual URL results
});


//delete URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  var selectedShortURL = req.params.shortURL;
  // testing whhat selectedShortURL is returning is
  // console.log("selectedShortURL: ", selectedShortURL);
  delete urlDatabase[selectedShortURL];

  res.redirect("/urls");
})


//update URLs
app.post("/urls/:shortURL/update", (req, res) => {
  var shortURL = req.params.shortURL;
  var newlongURL = req.body["newLongURL"]
  // testing new URL inputs
  // console.log("this should be hello", newlongURL);
  // console.log("this should be lighthouse: ", urlDatabase[shortURL]);
  urlDatabase[shortURL] = newlongURL;
  res.redirect("/urls");
})


//handling login submissions
app.post("/login", (req, res) => {
  var userNameSubmitted = req.body.username;
  // testing the submitted username:
  // console.log("username should be hannah: ", userNameSubmitted)
  res.cookie('username', userNameSubmitted);
  res.redirect("/urls");
})

// when user logs out, redirect to /urls
app.post("/logout", (req, res) => {
  res.clearCookie("username", {path: "/"});
  res.redirect("/urls");
})


//user registration page
app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_register", templateVars);
})

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  var newIDSet = {};
  newIDSet.id = newID;
  newIDSet.email = newEmail;
  newIDSet.password = newPassword;
  users[newID] = newIDSet;
  // testing the users database
  // console.log(users);
  res.cookie("user_ID", newID)
  // testing newEmail - getting back the string
  // console.log("newIDSet should return an object", newIDSet);
  res.redirect("/urls");
})






//redirect short URL to actual, long URL site
app.get("/u/:shortURL", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[shortURL]
  }
  res.redirect(longURL, templateVars);
});



//show the individual URL (individual page)
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id,
    longURL: urlDatabase[shortURL]
  }
  var shortURL = req.params.id;
  var longURL = urlDatabase[shortURL];
  res.render("urls_show", templateVars);
});



//server console msg
app.listen(PORT, () => {
  console.log(`tinyApp listening on port ${PORT}!`);
});







