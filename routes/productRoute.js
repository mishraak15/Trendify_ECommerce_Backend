const express= require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync');
const Product = require("../models/product");

router.post('/',wrapAsync(async (req, res) => {
    let { section } = req.params;
    section = section.charAt(0).toUpperCase() + section.slice(1);
  
    let { maxPrice, categories, sort } = req.body;
  
    if (maxPrice === 0) {
      maxPrice = 100000000;
    }
  
    if (sort) {
      sort === "asc" ? (sort = 1) : sort - 1;
    }
  
    let catData = [];
  
    if (categories && categories.length > 0) {
      if (sort) {
        catData = await Product.find({
          section: { $in: section },
          price: { $lte: maxPrice },
          category: { $in: categories },
        }).sort({ price: sort });
      } else {
        catData = await Product.find({
          section: { $in: section },
          category: { $in: categories },
          price: { $lte: maxPrice },
        });
      }
    } else {
      if (sort) {
        catData = await Product.find({
          section: { $in: section },
          price: { $lte: maxPrice },
        }).sort({ price: sort });
      } else {
        catData = await Product.find({
          section: { $in: section },
          price: { $lte: maxPrice },
        });
      }
    }
  
    res.status(200).json({ data: catData });
  }));

router.post('/setrange',wrapAsync(async (req, res) => {
    let { section } = req.params;
    section = section.charAt(0).toUpperCase() + section.slice(1);
    
    let completeData = await Product.find({
      section: { $in: section },
    });
  
    const prices = completeData.map((product) => product.price);
    let maxPriceLimit = Math.max(...prices);
    let minPriceLimit = Math.min(...prices);
  
    minPriceLimit= Math.round(minPriceLimit)-((Math.round(minPriceLimit)%10));
    maxPriceLimit= Math.round(maxPriceLimit)+(10-(Math.round(maxPriceLimit)%10));
  
    res.status(200).json({ minPriceLimit, maxPriceLimit });
  }));

module.exports= router;