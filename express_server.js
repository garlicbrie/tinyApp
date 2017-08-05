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
  var userCookie = req.cookies["user_ID"];

  //filtering function that returns a list of urls (object) for specific id
  function urlsForUser(id) {
    var urls = {};
    var userSpecificURLs;
    for (var shortURL in urlDatabase) {
      if (urlDatabase[shortURL]["user_ID"] === id) {
        urls[shortURL] = urlDatabase[shortURL]
      }
    }
    return urls
  }

  if (!userCookie) {
    res.status(400).send("Please log in first to view your shortend URLs!")
    return
  } else {
    userSpecificURLs = urlsForUser(userCookie);
  }

  // console.log("getting userCookie: ", userCookie);
  let templateVars = {
    user: users[userCookie],
    urlDatabase: urlDatabase,
    userSpecificURLs: userSpecificURLs
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
}


//show /urls/new page
app.get("/urls/new", (req, res) => {
  var userCookie = req.cookies["user_ID"];
  let templateVars = {
    user: users[userCookie]
  };
  if (!userCookie) {
    res.redirect("/login")
    return
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
  var newlongURL = req.body["newLongURL"];
  var userCookie = req.cookies["user_ID"];
  for (var shortURL in urlDatabase) {
    if (userCookie !== urlDatabase[shortURL]["user_ID"]) {
      res.status(400).send("This is not your URL to update!")
      return
    }
  }

  // testing new URL inputs
  // console.log("this should be hello", newlongURL);
  // console.log("this should be lighthouse: ", urlDatabase[shortURL]);
  urlDatabase[shortURL] = newlongURL;
  res.redirect("/urls");
})



//create login page
app.get("/login", (req, res) => {
  var userCookie = req.cookies["user_ID"];
  let templateVars = {
    user: users[userCookie],
  }
  res.render("urls_login", templateVars);
})


//handling login submissions
app.post("/login", (req, res) => {
  var userEmail = req.body.email;
  var userPassword = req.body.password;
  // console.log("useremail: ", userEmail);
  // console.log("password: ", userPassword);
  if (!userEmail || !userPassword) {
    res.status(400).send("Please enter email and password!")
    return
  }
  for (var user in users) {
    // console.log(users[user]);
    if (users[user].email === userEmail && users[user].password === userPassword) {
        var ID = users[user].id;
        res.cookie("user_ID", ID)
        res.redirect("/")
        return
    }
  }
  res.status(400).send("Either your email address or password seems to be wrong! Try again.");
  })




// when user logs out, redirect to /urls
app.post("/logout", (req, res) => {
  res.clearCookie("user_ID", {path: "/"});
  res.redirect("/urls");
})


//user registration page
app.get("/register", (req, res) => {
  var userCookie = req.cookies["user_ID"];
  let templateVars = {
    user: users[userCookie]
  };
  res.render("urls_register", templateVars);
})

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  users[newID] = {
    id: newID,
    email: newEmail,
    password: newPassword
  };
  if (!newEmail || !newPassword) {
    res.status(400).send("Please enter your email address and password!")
    return
  }
  for (const user in users) {
    if (newEmail === users[user].email) {
      res.status(400).send("This email already exists! Please log in.")
      return
    }
  }
  // testing the users database
  // console.log("users database now is: ", users);
  res.cookie("user_ID", newID)
  // testing newEmail - getting back the string
  // console.log("newIDSet should return an object", newIDSet);
  res.redirect("/urls");
})





//redirect short URL to actual, long URL site
app.get("/u/:shortURL", (req, res) => {
  var userCookie = req.cookies["user_ID"];
  let templateVars = {
    user: users[userCookie],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[shortURL]
  }
  res.redirect(longURL, templateVars);
});



//show the individual URL (individual page)
app.get("/urls/:id", (req, res) => {
  var userCookie = req.cookies["user_ID"];
  let templateVars = {
    user: users[userCookie],
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







