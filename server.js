const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Product = require("./models/product");
const cors = require("cors");
const homeRoute = require("./routes/homeRoute");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const MongoStore = require("connect-mongo"); // Storing session info in the mongo atlas
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session"); // storing session in session storage
const cookieParser =require("cookie-parser");
const User = require('./models/user');

app.use(
  cors({
    credentials: true,
    origin: "https://trendify-ecommerce-backend.onrender.com",
  })
);

const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.SERVER_PORT;
const Atlas_URL = process.env.MONGO_ATLAS_URL;

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //Importatnt
app.use(cookieParser());

async function main() {
  await mongoose.connect(Atlas_URL);
}

main()
  .then(() => {
    console.log("Connected to Database Successfully");
  })
  .catch((err) => {
    console.log(err);
  });

const store = MongoStore.create({
  mongoUrl: Atlas_URL,
  crypto: {
    secret: process.env.SECRET_KEY,
  },
  touchAfter: 24 * 60 * 60,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 din tak session ka data cookie ke form me store rahega.
    maxAge: 2 * 24 * 60 * 60 * 1000,
  },
};


app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/", homeRoute);

app.get(
  "/product/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let productData = await Product.find({ _id: id });
    res.status(200).json({msg:"Product Fetched Successfully",data: productData[0] });
  })
);

app.post(
  "/product/:id/addtocart",
  wrapAsync(async (req, res) => {

    let { id } = req.params;
    let {Userid, quantity} = req.body;

    let user = await User.findById(Userid);
    let productData = await Product.findById(id);

    user?.cart.push({productData: productData, quantity: quantity});
    await user.save();

    user = await User.findById(Userid).populate("cart.productData").populate('wishlist').populate("comparelist");
    res.status(200).json({msg:"Added to cart", user });
  })
);


app.post(
  "/product/:id/addtowishlist",
  wrapAsync(async (req, res) => {

    let { id } = req.params;
    let {Userid} = req.body;

    let user = await User.findById(Userid);
    let productData = await Product.findById(id);

    user?.wishlist.push(productData);
    await user.save();

    user = await User.findById(Userid).populate("cart.productData").populate('wishlist').populate("comparelist");
    res.status(200).json({msg:"Added to Wishlist", user });
  })
);


app.post(
  "/product/:id/addtocomparelist",
  wrapAsync(async (req, res) => {

    let { id } = req.params;
    let {Userid} = req.body;

    let user = await User.findById(Userid);
    let productData = await Product.findById(id);

    user?.comparelist.push(productData);
    await user.save();

    user = await User.findById(Userid).populate("cart.productData").populate('wishlist').populate("comparelist");
    res.status(200).json({msg:"Added to Comparelist", user });
  })
);


app.use("/products/:section", productRoute);

app.use("/user/:userid", userRoute);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!!"));
});

app.use((err, req, res, next) => {
  let {
    name = "Ooops!",
    statusCode = 500,
    message = "Something Went Wrong",
  } = err;
  console.log(name, message);
  res.status(statusCode).json({msg:"Something Went Wrong", message, name });
});

app.listen(PORT, () => {
  console.log(`App is listening at Port `, PORT);
});
