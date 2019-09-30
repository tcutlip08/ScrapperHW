var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

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

mongoose.connect("mongodb://localhost/articleHomework", {
  useNewUrlParser: true
});

app.get("/scrape", function(req, res) {
  axios
    .get("https://www.thetoptens.com/best-heavy-metal-songs/")
    .then(function(response) {
      var $ = cheerio.load(response.data);

      $("div .i").each(function(i, element) {
        console.log("/////////////////////////////////////////////////////");
        // console.log(element);
        var result = {};

        // result.title = $(this)
        //   .children("strong")
        //   .text();
        // result.link = $(this)
        //   .children("p")
        //   .text();

        console.log(
          $(this)
            .children("em")
            .text()
        );

        // db.Article.create(result)
        //   .then(function(dbArticle) {
        //     console.log(dbArticle);
        //   })
        //   .catch(function(err) {
        //     console.log(err);
        //   });
      });

      res.send("Scrape Complete");
    });
});

app.get("/articles", function(req, res) {
  db.Article.find({})
    .populate("note")
    .then(function(dbArticles) {
      res.json(dbArticles);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
  db.Article.find({ _id: req.params.id })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      db.Article.findByIdAndUpdate(req.params.id, { note: dbNote._id })
        .then(function(dbArticle) {
          res.json(dbArticle);
        })
        .catch(function(err) {
          res.json(err);
        });
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
