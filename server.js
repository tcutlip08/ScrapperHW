var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../public/html/index.html"));
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
    });
});

app.get("/songs", function(req, res) {
  db.Song.find({})
    .populate("note")
    .then(function(dbSongs) {
      res.json(dbSongs);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/songs/:id", function(req, res) {
  db.Song.find({ _id: req.params.id })
    .then(function(dbSong) {
      res.json(dbSong);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// app.post("/songs/:id", function(req, res) {
//   db.Note.create(req.body)
//     .then(function(dbNote) {
//       db.Song.findByIdAndUpdate(req.params.id, { note: dbNote._id })
//         .then(function(dbSong) {
//           res.json(dbSong);
//         })
//         .catch(function(err) {
//           res.json(err);
//         });
//     })
//     .catch(function(err) {
//       res.json(err);
//     });
// });

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
