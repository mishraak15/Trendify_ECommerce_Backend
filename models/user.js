const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  profilephoto: {
    filename: {
      type: String,
      default: "profilePhoto",
    },
    url: {
      type: String,
      default:
        "https://cdn-icons-png.freepik.com/512/64/64572.png?ga=GA1.1.343122819.1710065287&",
    },
  },
  gender:{
         type: String,
         enum: ["Male","Female","Others",""],
         default:"",
  },
  locations:[
       {
        type: String,
       }
  ],
  cart: [
    {
      productData:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: Number,
    },
  ],
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  comparelist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

userSchema.plugin(passportLocalMongoose);

let User = mongoose.model("User", userSchema);
module.exports = User;
