import express from "express";
import bodyParser from "body-parser"
import multer from 'multer';
import path from 'path';
import { render } from "ejs";


const app = express();
const port = 3000;

var postCount = 1;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



//Middleware for Handeling file upload 
const storage = multer.diskStorage({  
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const imgPostId = postCount;
        cb(null, "pic" + imgPostId +fileExtension);
    }
  });
  const upload = multer({ storage: storage });

//Middleware to update the post id's
function assignPostId(req, res, next){
    req.body.id = postCount++;
    next();
}

var posts = [];
// var posts = [
//     { id: 1, topic: "school",title: "First Post",publishDate: "nov 12", content: "This is the first post content." ,pic: "pic1.jpg"},
//     { id: 2, topic: "school",title: "Second Post", publishDate: "nov 12",content: "This is the second post content." , pic: ""},
//     { id: 2, topic: "school",title: "third Post", publishDate: "nov 12",content: "This is the second post content." , pic: ""},
//     { id: 2, topic: "school",title: "fourth Post", publishDate: "nov 12",content: "This is the second post content." , pic: ""},
//     { id: 2, topic: "school",title: "fifth Post", publishDate: "nov 12",content: "This is the second post content." , pic: ""},

//   ];

app.get("/makepost" , (req, res) => {
    res.render("makePost.ejs");
});

app.post("/create-post", upload.single('pic'), assignPostId, (req, res) => {
    const {id, title, topic, content} = req.body;
    const pic = req.file ? req.file.filename : '';
    const publishDate = new Date();
    const formattedDate = publishDate.toISOString().slice(0, 10);
    
    posts.push({
        id: id,
        topic: topic,
        title: title,
        publishDate: formattedDate,
        content: content,
        pic: pic
    });
    res.redirect("/")
});

app.get("/post/:id", (req, res) => {
    const postId = req.params.id;
    const post = posts.find(post => post.id === parseInt(postId));

    if (post){
        res.render("post.ejs", {post});
    } else {
        res.status(404).send("Post not found");
    }
});

app.get("/post/:id/edit", (req, res) => {
    const postId = req.params.id;
    const post = posts.find(post => post.id === parseInt(postId))

    res.render("editPost.ejs", {post});

});

app.post("/post/:id/edit", upload.single('pic'), (req, res) => {

    const postId = req.params.id;
    const {title, topic, content} = req.body;
    const existingPost = posts.find(post => post.id === parseInt(postId))

    if (!existingPost) {
        return res.status(404).send("Post not found...");
    }
    const pic = req.file ? req.file.filename :  existingPost.pic;
    const publishDate = new Date();
    const formattedDate = publishDate.toISOString().slice(0, 10);

    const updatedPost = {
        id: postId,
        title: title,
        topic: topic,
        publishDate: formattedDate,
        content: content,
        pic:pic
    } 

    const postIndex = posts.findIndex(post => post.id == postId);
    posts[postIndex] = updatedPost;
    res.redirect("/");

});

app.post("/post/:id/delete" ,(req, res) => {
    const postId = req.params.id;
    const deleteIndex = posts.findIndex(post => post.id === parseInt(postId));

    if (deleteIndex !== -1) {
        posts.splice(deleteIndex, 1); // Remove the post
      }
    res.redirect("/")
});

app.get("/", (req, res) => {
    
    res.render("home.ejs" , {
        posts:posts
    });
});

app.listen(port, () =>{
    console.log(`server running on port ${port}`);
});
