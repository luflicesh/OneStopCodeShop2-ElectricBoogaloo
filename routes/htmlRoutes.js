var db = require("../models");

module.exports = function (app) {
  // Load index page
  app.get("/", function (req, res) {
    res.render("index", {
      msg: "Welcome to the electric boogaloo!",
      success: req.session.success
    });
  });

  // Load example page and pass in an example by id
  // LOGIN ROUTES
  app.get("/login", function (req, res) {
    res.render("login/index", {
      msg: "Welcome back/Create new?",
      title: "Form Validation",
      success: req.session.success,
      errors: req.session.errors
    });
  });

  app.post("/login", function (req, res) {
    db.Users.findOne({
      where: {
        user_name: req.body.username
      }
    }).then(function (user) {
      req
        .check("password", "Password is invalid")
        .isLength({
          min: 4
        })
        .equals(user.user_pass);
      var errors = req.validationErrors();
      if (errors) {
        req.session.errors = errors;
        req.session.success = false;
      } else {
        req.session.success = true;
        res.redirect("/forum");
      }
    });
  });

  // CREATE ACCOUNT ROUTES
  app.get("/register", function (req, res) {
    res.render("register/index", {
      title: "Form Validation",
      success: req.session.success,
      errors: req.session.errors
    });
  });

  app.post("/register", function (req, res) {
    req
      .check("password", "Password is invalid")
      .isLength({
        min: 4
      })
      .equals(req.body.confirmPassword);
    var errors = req.validationErrors();
    if (errors) {
      req.session.errors = errors;
      req.session.success = false;
    } else {
      db.Users.create({
        user_name: req.body.username,
        user_pass: req.body.password,
        user_level: 0
      }).then(function () {
        req.session.success = true;
        res.redirect("/forum");
      });
    }
  });

  app.get("/forum", function (req, res) {
    if (req.session.success) {
      db.Topics.findAll({}).then(function (dbTopics) {
        db.Posts.findAll({}).then(function (dbPosts) {
          res.render("forum/index", {
            msg: "Welcome to the forum!",
            topics: dbTopics,
            posts: dbPosts,
            session: req.session.success
          });
          // db.Posts.findAll({}).then(function(dbPosts) {
          //   res.render("forum/index", {
          //     posts: dbPosts
          //   });
        });
      });
    } else {
      res.redirect("/login");
    }
    req.session.errors = null;
  });

  // app.put("/forum", function (req, res) {
  //   if (req.session.success) {
  //     db.Posts.findAll({}).then(function (dbPosts) {
  //       res.render("forum/index", {
  //         msg: "Welcome to the forum!",
  //         posts: dbPosts,
  //         session: req.session.success
  //       });
  //     });
  //   } else {
  //     res.redirect("/login");
  //   }
  //   req.session.errors = null;
  // });

  app.get("/account", function (req, res) {
    if (req.session.success) {
      db.Users.findOne({}).then(function (dbUsers) {
        res.render("myAccount/index", {
          users: dbUsers,
          success: req.session.success
        });
      });
    } else {
      res.redirect("/login");
    }
  });

  app.get("/topics", function (req, res) {
    if (req.session.success) {
      db.Topics.findAll({}).then(function (dbTopics) {
        res.render("topics/index", {
          topics: dbTopics,
          success: req.session.success
        });
      });
    } else {
      res.redirect("/login");
    }
  });

  app.get("/users/:id", function (req, res) {
    if (req.session.success) {
      db.Users.findOne({}).then(function (dbUsers) {
        db.Posts.findAll({ where: { UserId: req.param.id } }).then(function (dbPosts) {
          db.Replies.findAll({ where: { UserId: req.param.id } }).then(function (dbReplies) {
            res.render("author/index", {
              user: dbUsers,
              userPosts: dbPosts,
              userReplies: dbReplies,
              success: req.session.success
            });
          });
        });
      });
    } else {
      res.redirect("/login");
    }
  });

  app.get("/posts", function (req, res) {
    if (req.session.success) {
      db.Posts.findAll({}).then(function (dbPosts) {
        res.render("posts/index", {
          posts: dbPosts,
          success: req.session.success
        });
      });
    } else {
      res.redirect("/login");
    }
  });

  app.get("/add-a-post", function (req, res) {
    if (req.session.success) {
      // db.Posts.create({}).then(function(dbPosts) {
      res.render("createPost/index", {
        //     newPost: dbPosts
        //   });
      });
    } else {
      res.redirect("/login");
    }
  });
  // });

  app.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/");
  });
};
