const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user");
const { storage } = require("../cloudConfig");
const multer = require("multer");
const upload = multer({ storage });

router.get(
  "/fetchProfileData",
  wrapAsync(async (req, res) => {
    let { userid } = req.params;
    let userData = await User.findById(userid)
      .populate("cart.productData")
      .populate("wishlist")
      .populate("comparelist");
    res.status(200).json({ msg: "Fetched User Data Successfully", userData });
  })
);

router.post(
  "/editprofile",
  upload.single("profilephoto"),
  wrapAsync(async (req, res) => {
    let { username, email, locations, gender } = req.body;
    let { userid } = req.params;

    let editedUser = await User.findByIdAndUpdate(
      userid,
      {
        username: username,
        email: email,
        locations: locations,
        gender: gender,
      },
      { runValidators: true, new: true }
    )
      .populate("cart.productData")
      .populate("wishlist")
      .populate("comparelist");

    if (typeof req.file != "undefined") {
      editedUser.profilephoto = {
        filename: req.file.filename,
        url: req.file.path,
      };
    }

    let user = await editedUser.save();
    res.status(200).json({ msg: "User Edited Successfully", user });
  })
);

router.get(
  "/mycart",
  wrapAsync(async (req, res) => {
    let { userid } = req.params;

    let user = await User.findById(userid)
      .populate("cart.productData")
      .populate("wishlist")
      .populate("comparelist");
    let cartData = user.cart;
    res.status(200).json({ msg: "Cart Data Fetched", cartData });
  })
);

router.post(
  `/setquantity`,
  wrapAsync(async (req, res) => {
    let { userid } = req.params;
    let { q, itemid } = req.body;
    await User.updateOne(
      { _id: userid, "cart._id": { $in: itemid } },
      { $set: { "cart.$.quantity": q } }
    );
    let currUser = await User.findById(userid)
      .populate("cart.productData")
      .populate("wishlist")
      .populate("comparelist");
    res.status(200).json({ msg: "Quantity Changed Successfully", currUser });
  })
);

router.get(
  `/mywishlist`,
  wrapAsync(async (req, res) => {
    let { userid } = req.params;
    let user = await User.findById(userid)
      .populate("cart.productData")
      .populate("wishlist")
      .populate("comparelist");
    let wishlist = user?.wishlist;
    res
      .status(200)
      .json({ msg: "WishList Data Fetched Successfully", wishlist });
  })
);

router.post(
  `/removefromwishlist`,
  wrapAsync(async (req, res) => {
    let { userid } = req.params;
    let { itemid } = req.body;
    let user = await User.findById(userid)
      .populate("cart.productData")
      .populate("wishlist")
      .populate("comparelist");

    let wishlist = user?.wishlist;
    let newWishlist = wishlist.filter((item) => item.id !== itemid);
    user.wishlist = newWishlist;
    await user.save();

    user = await User.findById(userid)
      .populate("wishlist")
      .populate("cart.productData");

    res.status(200).json({ msg: "Removed from Wishlist", user });
  })
);

router.get(
  `/mycomparison`,
  wrapAsync(async (req, res) => {
    let { userid } = req.params;
    let user = await User.findById(userid)
      .populate("cart.productData")
      .populate("wishlist")
      .populate("comparelist");
    let comparelist = user?.comparelist;
    res
      .status(200)
      .json({ msg: "Comparison Data Fetched Successfully", comparelist });
  })
);

router.post(
  `/deletefromcomparison`,
  wrapAsync(async (req, res) => {
    let { userid } = req.params;
    let { itemid } = req.body;

    let user = await User.findById(userid)
      .populate("cart.productData")
      .populate("wishlist")
      .populate("comparelist");
    let newComparelist = user?.comparelist?.filter((c)=> c.id !== itemid);
    user.comparelist=newComparelist;
    await user.save();
    res
      .status(200)
      .json({ msg: "Deleted from Comparison", user });
  })
);

module.exports = router;
