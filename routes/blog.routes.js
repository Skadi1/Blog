const { Router } = require("express");
const User = require("../models/User");
const Blog = require("../models/Blog");
const Post = require("../models/Post");
const config = require("config");
const { check, validationResult } = require("express-validator");
const AuthMiddleware = require("../middleware/auth.middleware");
const Comment = require("../models/Comment");
const multer = require("multer");
const fs = require("fs");
const { v4: uuid } = require("uuid");
var _ = require("lodash");

//
//
const upload = multer({ dest: "uploads/" });

//*
let router = Router();
//*
router.post("/generate", async (req, res) => {
  try {
    const { from } = req.body;

    const existing = await Link.findOne({ from });

    if (existing) {
      res.status(500).json({ message: "That link already exists" });
    }
    const baseUrl = config.get("baseUrl");
    const code = shortId.generate();

    const to = baseUrl + "/t/" + code;

    const link = new Link({
      from,
      to,
      code,
      owner: req.user.userId,
    });

    await link.save();

    res.status(201).json({ link, message: "Link has been created" });
  } catch (error) {
    res.status(500).json({ message: "Error from router", error });
  }
});
router.get("/getBlogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    //
    let blogs = [];
    blogs = await Blog.find({ owner: id });
    //
    if (blogs.length === 0) {
      return res
        .status(500)
        .json({ blogsId: [], message: "No blogs for that user" });
    }
    //
    //FIND THE POSTS FOR EVERY BLOG
    //
    // for (let i = 0; i < blogs.length; i++) {
    //   let posts = await Post.find({ owner: blogs[i]._id });
    //   blogs[i].posts = posts;
    // }
    //
    //FORMAT EVERY POST
    //
    // for (let i = 0; i < blogs.length; i++) {
    //   for (let l = 0; l < blogs[i].posts.length; l++) {
    //     let post = blogs[i].posts[l];
    //     blogs[i].posts[l] = {
    //       id: post._id,
    //       title: post.title,
    //       createDate: post.createDate
    //     };
    //   }
    // }

    //
    // FORMATE THE BLOG
    //
    const formatedBlogs = blogs.map(obj => {
      return { title: obj.title, id: obj._id };
    });

    return res
      .status(200)
      .json({ blogsId: formatedBlogs, message: "Blogs have been searched" });
  } catch (error) {
    res.status(500).json({ message: "Error from router", error });
  }
});
router.get("/getUserBlogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    //
    let blogs = [];
    blogs = await Blog.find({ owner: id });
    //
    if (blogs.length === 0) {
      return res
        .status(500)
        .json({ blogs: [], message: "No blogs for that user" });
    }
    //
    // FIND THE POSTS FOR EVERY BLOG
    //

    for (let i = 0; i < blogs.length; i++) {
      let posts = await Post.find({ owner: blogs[i]._id });

      posts = posts.map(post => {
        delete post._doc.html;

        return post;
      });

      blogs[i].posts = posts.reverse();
    }

    //
    // FORMATE THE BLOG
    //
    const formatedBlogs = blogs.map(obj => {
      return { title: obj.title, _id: obj._id, posts: obj.posts };
    });

    return res
      .status(200)
      .json({ blogs: formatedBlogs, message: "Blogs have been searched" });
  } catch (error) {
    res.status(500).json({ message: "Error from router", error });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    //
    if (!blog) {
      return res.status(500).json({ message: "No blog was found" });
    }
    //
    let posts = await Post.find({ owner: id });
    //
    let formatedPost = posts.map(post => {
      let html = post.html;

      let fhtml = html.replace(
        /<div style="text-align: center;"><img src.*?<\/div>/g,
        ""
      );
      let finalHtml = fhtml.substring(0, 250);
      let fPost = {
        title: post.title,
        id: post._id,
        createDate: post.createDate,
        html: finalHtml,
      };

      return fPost;
    });
    //
    formatedPost.reverse();
    blog._doc.posts = formatedPost;
    //
    return res.status(200).json({ blog, message: "Blog have been searched" });
  } catch (error) {
    res.status(500).json({ message: "Error from router", error });
  }
});

router.post("/createBlog", async (req, res) => {
  try {
    const { userId, newBlog } = req.body;

    let blog = new Blog({ title: newBlog.title, owner: userId });

    await blog.save();

    let createdBlog = {
      title: blog.title,
      id: blog._id,
    };
    return res
      .status(200)
      .json({ blog: createdBlog, message: "Blog have been created" });
  } catch (error) {
    res.status(500).json({ message: "Error from router", error });
  }
});

router.get("/delete/:id", async (req, res) => {
  try {
    // const { userId, newBlog } = req.body;
    const { id } = req.params;

    let blog = await Blog.findById(id);
    let posts = await Post.find({ owner: id });
    if (posts.length) {
      for (let index = 0; index < posts.length; index++) {
        await posts[index].remove();
      }
    }

    await blog.remove();

    return res.status(200).json({ message: "Blog have been deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error from router", error });
  }
});
//
//
//POSTS
//
//
router.post("/createPost/:id", async (req, res) => {
  try {
    const { newPost } = req.body;
    const { id } = req.params;

    let post = new Post({ title: newPost.title, owner: id });

    await post.save();

    let createdPost = {
      title: post.title,
      id: post._id,
      createDate: post.createDate,
    };
    return res
      .status(200)
      .json({ post: createdPost, message: "Post have been created" });
  } catch (error) {
    res.status(500).json({ message: "Error from router", error });
  }
});
router.delete("/deletePost/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let post = await Post.findById(id);
    //
    if (!post) {
      return res.status(404).json({ message: "Post hadnt found" });
    }
    await post.deleteOne();

    return res.status(200).json({ message: "Post have been deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error from router", error });
  }
});
router.patch("/updatePost/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { post } = req.body;

    let postToUpdate = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post hadnt found" });
    }
    postToUpdate.title = post.title;
    postToUpdate.html = post.html;

    await postToUpdate.save();

    let formatedPost = {
      title: postToUpdate.title,
      html: postToUpdate.html,
    };

    // await post.deleteOne();

    return res
      .status(200)
      .json({ post: formatedPost, message: "Post have been updated" });
  } catch (error) {
    res.status(500).json({ message: "Error from router", error });
  }
});
router.get("/getPost/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // const { post } = req.body;

    let post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post hadnt found" });
    }
    let comments = await Comment.find({ post: id });
    if (comments.length) {
      post._doc.comments = comments;
    }
    return res.status(200).json({ post, message: "Post have been found" });
  } catch (error) {
    res.status(500).json({ message: "Error from router", error });
  }
});
router.get("/search/:search/:size", async (req, res) => {
  try {
    const { search, size } = req.params;
    const sizeSearcList = size;

    //
    function AdField(array, value) {
      return array.map(item => {
        item._doc.type = value;
        return item;
      });
    }
    //
    let re = new RegExp(`${search}`, "gi");
    //
    let users = await User.find();
    let userSet = new Set();
    users.forEach(user => {
      if (user.FirstName.match(re) || user.LastName.match(re)) {
        userSet.add(user);
      }
    });
    users = [...userSet];
    users = AdField(users, "user");
    users = users.map(user => {
      let newUser = {
        ...user._doc,
        dataImage: user._doc.ProfileImage.data.toString("base64"),
      };
      delete newUser.password;
      delete newUser.email;
      delete newUser.ProfileImage;
      delete newUser.blogs;
      return newUser;
    });
    // console.log('USERS:', users);
    //
    //
    let blogs = await Blog.find({ title: re });
    blogs = AdField(blogs, "blog");
    //
    //
    let posts = await Post.find({ title: re });
    posts = AdField(posts, "post");
    //
    //
    let resultsArray = [...users, ...blogs, ...posts];
    let shuffleResults = _.shuffle(resultsArray);
    let results =
      shuffleResults.length > sizeSearcList
        ? shuffleResults.slice(0, 5)
        : shuffleResults;

    return res
      .status(200)
      .json({ results, message: "Results have been found" });
  } catch (error) {
    res.status(500).json({ message: "Error from router", error });
  }
});
//
//COMMNENT
//
router.post("/newComment", async (req, res) => {
  try {
    const { newComment } = req.body;

    let user = await User.findById(newComment.userId);

    let comment = new Comment({
      createDate: Date.now(),
      value: newComment.value,
      owner: newComment.userId,
      post: newComment.postId,
    });

    await comment.save();

    comment._doc.dataImage = user.ProfileImage.data.toString("base64");
    comment._doc.FirstName = user.FirstName;
    comment._doc.LastName = user.LastName;

    return res
      .status(200)
      .json({ comment, message: "Comment have been created" });
  } catch (error) {
    res.status(500).json({ message: "Error from router", error });
  }
});

module.exports = router;
