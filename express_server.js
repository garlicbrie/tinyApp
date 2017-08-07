var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

//accessing bodyparser middleware and allowing the POST request
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//replaceing cookie parser middleware with cookie session
var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['itsSuperSecret']
}));

//requiring bcrypt for securing database
const bcrypt = require('bcrypt');


var urlDatabase = {
  "b2xVn2": {"longURL": "http://www.lighthouselabs.ca",
             "user_ID": "hannah"},
  "9sm5xK": {"longURL": "http://www.google.com",
             "user_ID": "hannah"},
  "ck20Ls": {"longURL": "https://web-compass.lighthouselabs.ca/days/w2d4/activities/489",
             "user_ID": "grace"}
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
  }
};


//handling get request
app.get("/", (req, res) => {
  res.send("<html><body>Welcome to tinyApp! <a href='/urls'> click here to view your urls </a></body></html>\n");
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
  var userCookie = req.session.user_id;
  console.log("get urls usercookie: ", userCookie);
  // var email = users[userCookie]["email"];
  // console.log("email: ", email);

  //filtering function that returns a list of urls (object) for specific id
  function urlsForUser(id) {
    var urls = {};
    var userSpecificURLs;
    for (var shortURL in urlDatabase) {
      if (urlDatabase[shortURL]["user_ID"] === id) {
        urls[shortURL] = urlDatabase[shortURL];
      }
    }
    return urls;
  };
  if (!userCookie) {
    res.status(400).send("Please log in first to view your shortend URLs!");
    return
  } else {
    userSpecificURLs = urlsForUser(userCookie);
  };
  let templateVars = {
    urlDatabase: urlDatabase,
    userSpecificURLs: userSpecificURLs,
    user: users[userCookie]["email"]
  }
  // console.log(userLoggedIn.username)
  res.render("urls_index", templateVars);
});


//Generate a Random ShortURL
function generateRandomString() {
  var result = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    result += possible.charAt(Math.floor(Math.random() * possible.length));

  return result;
};


//show /urls/new page
app.get("/urls/new", (req, res) => {
  var userCookie = req.session.user_id;
  let templateVars = {
    user: users[userCookie]
  };
  if (!userCookie) {
    res.redirect("/login");
    return
  }
  res.render("urls_new", templateVars);
});


//add new URLs
app.post("/urls", (req, res) => {
  const newURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: newURL,
    user_ID: req.session.user_id
  }

  // urlDatabase[shortURL] = newURL;
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
});


//update URLs
app.post("/urls/:shortURL/update", (req, res) => {
  var shortURL = req.params.shortURL;
  var newlongURL = req.body["newLongURL"];
  var userCookie = req.session.user_id;
  for (var shortURL in urlDatabase) {
    if (userCookie !== urlDatabase[shortURL]["user_ID"]) {
      res.status(400).send("This is not your URL to update!");
      return
    }
  }

  // testing new URL inputs
  // console.log("this should be hello", newlongURL);
  // console.log("this should be lighthouse: ", urlDatabase[shortURL]);
  urlDatabase[shortURL] = newlongURL;
  res.redirect("/urls");
});


//user registration page
app.get("/register", (req, res) => {
  let templateVars = {
    user: req.session.user_id
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const newEmail = req.body.email;

  const newPassword = req.body.password;
  const hashed_newPassword = bcrypt.hashSync(newPassword, 10);

  if (!newEmail || !newPassword) {
    res.status(400).send("Please enter your email address and password!");
    return
  };

  for (const user in users) {
    if (newEmail === users[user].email) {
      res.status(400).send("This email already exists! Please log in.");
      return
    }
  };
  // Putting new user to the database
    users[newID] = {
    id: newID,
    email: newEmail,
    password: hashed_newPassword
  };

  // testing to see new users database with newly registered user
  console.log("users: ", users);

  req.session.user_id = newID;
  // console.log(req.session.user_id);

  // res.cookie("user_ID", newID);
  // testing newEmail - getting back the string
  // console.log("newIDSet should return an object", newIDSet);
  res.redirect("/urls");
});


//create login page
app.get("/login", (req, res) => {
  var userCookie = req.session.user_id;
  var email = users[userCookie]["email"];
  let templateVars = {
    user: email
  }
  res.render("urls_login", templateVars);
});


//handling login submissions
app.post("/login", (req, res) => {
  var userEmail = req.body.email;
  var userPassword = req.body.password;
  if (!userEmail || !userPassword) {
    res.status(400).send("Please enter email and password!")
    return
  }
  for (var user in users) {
    if (users[user].email === userEmail && bcrypt.compareSync(userPassword, users[user]["password"])) {
        var ID = users[user].id;
        req.session.user_id = ID;
        res.redirect("/");
        return
    }
  }
  res.status(400).send("Either your email address or password seems to be wrong! Try again.");
  });


// when user logs out, redirect to /urls
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


//redirect short URL to actual, long URL site
app.get("/u/:shortURL", (req, res) => {
  var userCookie = req.session.user_id;
  let templateVars = {
    user: users[userCookie],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[shortURL]
  }
  res.redirect(longURL, templateVars);
});


//show the individual URL (individual page)
app.get("/urls/:id", (req, res) => {
  var userCookie = req.session.user_id;
  var shortURL = req.params.id;
  var longURL = urlDatabase[shortURL]["longURL"];
  let templateVars = {
    user: users[userCookie],
    shortURL: req.params.id,
    longURL: urlDatabase[shortURL]["longURL"]
  };
  res.render("urls_show", templateVars);
});


//server console msg
app.listen(PORT, () => {
  console.log(`tinyApp listening on port ${PORT}!`);
});







