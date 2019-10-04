var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var exphbs = require("express-handlebars");

var app = express();
var PORT = 3000;

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// Initialize Express

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/top50";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.get("/", function(req, res) {
  db.Song.find({})
    .then(function(dbSongs) {
      console.log(dbSongs);
      res.render("index", { dbSongs });
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/scrape", function(req, res) {
  axios
    .get("https://www.thetoptens.com/best-heavy-metal-songs/")
    .then(function(response) {
      var $ = cheerio.load(response.data);

      $("div .i").each(function(i, element) {
        var result = {};

        result.title = $(this)
          .children("b")
          .text();
        result.list = $(this)
          .children("em")
          .text();

        db.Song.create(result)
          .then(function(songAndArtist) {
            // console.log(songAndArtist);
          })
          .catch(function(err) {
            console.log(err);
          });
      });

      res.send("Scrape Complete");
    })
    .catch(function(err) {
      console.log(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
