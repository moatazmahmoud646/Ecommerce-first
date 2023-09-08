const express = require("express");
const router =require("express").Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const passport = require('passport')
const flash = require("connect-flash");
const User = require("../models/User")
const bcrypt = require('bcryptjs');
const { isAdmin } = require('../middleware/auth');
const path = require('path');

const Product = require('../models/product');
//const Order = require('../models/order');
const Customer = require('../models/User');
//const Coupon = require('../models/coupon');
//const { formatCurrency } = require('../utils/helpers');
const multer = require('multer');
const product = require("../models/product");
exports.getAllProducts = async (req, res) => {
    try {
      const products = await Product.find();
      res.render("customer/products", { products });
    } catch (error) {
      console.log(error);
      res.render("error");
    }
  };