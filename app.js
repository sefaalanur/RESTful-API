//jshint esversion:8

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/wikiDB", {useNewUrlParser: true});
const articleSchema = {
  title: String,
  content: String
};
const Article = mongoose.model("Article", articleSchema);

app.get("/articles", async function(req, res){
  try {
    const foundArticles = await Article.find();
    console.log(foundArticles);
    res.send(foundArticles);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.post("/articles", function(req,res) {
  const newArticle = new Article({
    title: req.body.title,
    content: req.body.content
  });
  newArticle.save();
});

app.delete(function(req, res){

  Article.deleteMany(function(err){
    if (!err){
      res.send("Successfully deleted all the articles in wikiDB.");
    } else {
      res.send(err);
    }
  });

});

/////////////////////////Individual Articles///////////////////////////////////


app.get('/articles/:articleTitle', function(req, res) {
  const articleTitle = req.params.articleTitle;
  Article.findOne({title: articleTitle})
    .then(article => {
      if (article) {
        res.json(article);
      } else {
        res.status(404).send('Article not found.');
      }
    })
    .catch(err => {
      res.status(500).send('Error retrieving article: ' + err.message);
    });
});


app.put('/articles/:articleTitle', function(req, res) {
  const articleTitle = req.params.articleTitle;
  Article.findOneAndUpdate(
    { title: articleTitle },
    { title: req.body.title, content: req.body.content },
    { overwrite: true }
  )
    .then(() => {
      res.send("Successfully updated article.");
    })
    .catch(err => {
      res.status(500).send('Error updating article: ' + err.message);
    });
});


app.patch('/articles/:articleTitle', function(req, res) {
  const articleTitle = req.params.articleTitle;

  Article.findOneAndUpdate({ title: articleTitle }, { content: req.body.newContent })
    .then(result => {
      res.send("Successfully updated selected article.");
    })
    .catch(err => {
      res.status(500).send("Error updating article: " + err.message);
    });
});




app.delete('/articles/:articleTitle', function(req, res) {
  const articleTitle = req.params.articleTitle;
  Article.findOneAndDelete({title: articleTitle})
    .then(result => {
      if (result) {
        res.send("Successfully deleted selected article.");
      } else {
        res.status(404).send('Article not found.');
      }
    })
    .catch(err => {
      res.status(500).send('Error deleting article: ' + err.message);
    });
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
