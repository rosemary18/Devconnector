const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load model
const Post = require("../../models/posts");
const Profile = require("../../models/profile");
//load validation file
const validatePostInput = require("../../validation/posts");

router.get("/test", (req, res) => res.json("Posts Working"));

//@route  GET api/posts
//@desc   Get Post
//@access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostfound: "No post found!" }));
});
//@route  GET api/posts/:id
//@desc   Get Post by id
//@access Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({ nopostfound: "Post not found with that ID!" })
    );
});

//@route  POST api/posts
//@desc   Create Post
//@access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    //Check validation
    if (!isValid) {
      //return any errors
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);
//@route  Delete api/posts/:id
//@desc   Delete Post
//@access Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //check for owner
          if (post.user.toString() !== req.user.id) {
            //action
            return res
              .status(401)
              .json({ notauthorized: "You cannot delete that post." });
          }
          //delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found!" }));
    });
  }
);
//@route  POST api/posts/like/:id
//@desc   like Post
//@access Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "You already liked this post" });
          }
          //add like
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(400).json(err));
    });
  }
);
//@route  POST api/posts/unlike/:id
//@desc   unlike Post
//@access Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res.status(400).json({ unlike: "You unliked this post" });
          }
          //remove like
          //remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          //Splice out of array
          post.likes.splice(removeIndex, 1);

          //save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(400).json(err));
    });
  }
);
//@route  POST api/posts/comment/:id
//@desc   add comment
//@access Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    //Check validation
    if (!isValid) {
      //return any errors
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };
        //add comment array
        post.comment.unshift(newComment);

        //Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ notfound: "Post not found" }));
  }
);

//@route  Delete api/posts/comment/:id
//@desc   delete comment
//@access Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id).then(post => {
      //Check if comment exist
      if (
        post.comment.filter(
          comment => comment._id.toString() === req.params.comment_id
        ).length === 0
      ) {
        return res.status(404).json({ commentnotexists: "Comment not exist" });
      }
      //get remove index
      const removeIndex = post.comment
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);
      //Splice out of array
      post.comment.splice(removeIndex, 1);

      //save
      post.save().then(post => res.json(post));
    });
  }
);
module.exports = router;
