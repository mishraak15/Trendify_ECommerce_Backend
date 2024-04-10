const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const Product = require("../models/product");
const passport = require("passport");
const User = require("../models/user");

router.get(
  "/",
  wrapAsync(async (req, res) => {
    let featured = await Product.find({
      category: { $in: ["Watches", "Goggles"] },
    });
    let trending = await Product.find({ newSeason: true });
    res.status(200).json({ featured, trending });
  })
);

router.post(
  "/login",
  passport.authenticate("local"),
  wrapAsync(async (req, res) => {
    let { username } = req.body;
    let currUser = await User.findOne({ username: username })
      .populate("cart.productData")
      .populate("wishlist")
      .populate("comparelist");
    res.status(200).json({ msg: "Logged-In Successfully", username, currUser });
  })
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ msg: "Logout Successfully" });
  });
});

router.post("/signup", async (req, res) => {
  try {
    let { email, username, password } = req.body;
    const newUser = new User({ email: email, username: username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
    });
    let currUser = await User.findOne({ username: username })
      .populate("cart.productData")
      .populate("wishlist")
      .populate("comparelist");
    res.status(200).json({ msg: "Signup-Login Successful", currUser });
  } catch (err) {
    res.status(400).json({ msg: "Error in Signup", err });
  }
});

router.post(
  "/changePass",
  wrapAsync(async (req, res, next) => {
    let currUser = await User.findById(req.body.id);
    currUser.changePassword(req.body.oldPass, req.body.newPass, function (err) {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ msg: "Password Changed Successfully" });
      }
    });
  })
);

router.post(
  "/stores",
  wrapAsync(async (req, res) => {
    let { search } = req.body;
    search = search.toLowerCase().trim();
    let data = await Product.find({keyword : { $in: search } });
    if(search===''){
      data=await Product.find({});
    }
    res.status(200).json({ msg: "Fetched Stores Data", data });
  })
);

router.get(
  "/:user/cartData",
  wrapAsync(async (req, res) => {
    let { user } = req.params;
    let currUser = await User.findById(user).populate("cart.productData");
    let data = currUser?.cart;
    res.status(200).json({ msg: "Fetched Successfully", data });
  })
);

router.get(
  "/:user/clearcart",
  wrapAsync(async (req, res) => {
    let { user } = req.params;
    let currUser = await User.findById(user)
      .populate("cart.productData")
      .populate("wishlist")
      .populate("comparelist");
    currUser.cart = [];
    await currUser.save();
    res.status(200).json({ msg: "Cleared Cart", currUser });
  })
);

router.get(
  "/:user/deleteitemfromcart/:itemId",
  wrapAsync(async (req, res) => {
    let { user, itemId } = req.params;
    let currUser = await User.findById(user)
      .populate("cart.productData")
      .populate("wishlist")
      .populate("comparelist");

    let newCart = currUser.cart.filter((item) => item.id !== itemId);

    currUser.cart = newCart;
    await currUser.save();

    res.status(200).json({ msg: "Removed From Cart", currUser });
  })
);

module.exports = router;
