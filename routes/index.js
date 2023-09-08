const express = require("express");
const router =require("express").Router()
const { ensureAuth, ensureGuest, isAdmin } = require('../middleware/auth')
const passport = require('passport')
const flash = require("connect-flash");
const User = require("../models/User")
//const product = require("../models/product");
const bcrypt = require('bcryptjs');
const Product = require('../models/product');
const Cart =require('../models/cart');
//const admin = require("../models/admin");
router.get('/', ensureGuest, (req, res) => {
  res.render('home')
});

  router.get('/register', ensureGuest, (req, res) => {
    res.render('register', 
    {layout: 'register'});
  });
  
router.post("/register",async(req,res)=>{
    const { name, email, password,confirmPassword,DateOfBirth } = req.body;

    try {
        const passwordRegex =/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+~`={}\[\]:;"'<>,.?\/\\]).{8,}$/;
    
    const userExists = await User.findOne({ email: email });
    if (userExists) {
        // return res.render('register', { errorMessage: 'An account with this email already exists. Please log in or use a different email.' });
         res.send('<script>alert("An account with this email already exists. Please log in or use a different email."); window.history.back();</script>')
       }
       else if (password !== confirmPassword) {
         res.send('<script>alert("Passwords do not match. Please try again."); window.history.back();</script>')
   
         //return res.render('register', { errorMessage: 'Passwords do not match. Please try again.' });
       }
       else if (!passwordRegex.test(password)) {
         res.send('<script>alert("Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."); window.history.back();</script>')
       }
       else {
         const dob = new Date(DateOfBirth);
         const now = new Date();
         const age = now.getFullYear() - dob.getFullYear();
         if (age < 18) {
           res.send('<script>alert("You must be at least 18 years old to register."); window.history.back();</script>');
         }
        
         else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const user_register = new User({ name, email,  password: hashedPassword,DateOfBirth });
            await user_register.save();
            res.render('login');
            console.log("done");
            }
        
        
        }



} catch (error) {
    console.error(error);
    res.render('register', { errorMessage: 'Registration failed. Please try again.' });
    }


})


router.get('/', (req, res) => {
  res.render('login', { message: req.flash('error') });})

router.post('/login', passport.authenticate('local',  {
  failureRedirect: '/',
  failureFlash: true,
  passReqToCallback: true
}), (req, res) => {
  if (req.user.isAdmin) {
    res.render('admin/admindash'); // Redirect to admin dashboard
  } else {
    res.redirect('/udashboard') // Redirect to user dashboard
  }
});
router.get('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) {
      //req.clearCookie('connect.sid');
      return next(error);   
           
    }
    res.redirect('/');
});
})
//const product = require("../models/product")
router.get('/udashboard',ensureAuth, async (req, res) => {
  //const user = await User.findOne({isAdmin})
  try {
    const products = await Product.find();
       if (products.length === 0) {
        console.log("No products found in database");}
       res.render("udashboard", { products });
     } catch (error) {
       console.log(error);
       res.render("error");
     }
  
 });
 router.get('/cart',ensureAuth, async (req, res) => {
  try {
    // Find the cart associated with the user
    const cart = await Cart.findOne({ userId: req.session.passport.user}).populate('items.product').lean();
    //console.log("cart q",cart)
    // Calculate the total price of the items in the cart
    const totalPrice = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Render the cart view with the cart details
    res.render('cart', { cart, totalPrice });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
});
 const { body, validationResult } = require('express-validator');
 
 
 router.post('/cart', async (req, res) => {
  try {
    const product = await Product.findById(req.body.productId).lean();
    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Find the cart associated with the user
    let cart = await Cart.findOne({ userId: req.session.passport.user });

    if (!cart) {
      // If the user does not have a cart, create a new one
      cart = new Cart({
        userId: req.session.passport.user,
        items: [
          {
            
            product: product._id,
            name: product.name,
            imageUrl: product.imageUrl,
            price: product.price,
            quantity: 1
          }
        ]
      });
    } else {
      // If the user has a cart, check if the product already exists in the cart
      const itemIndex = cart.items.findIndex(item => item.product.equals(product._id));
      if (itemIndex > -1) {
        // If the product already exists in the cart, decrease the quantity
      /*  if (cart.items[itemIndex].quantity > 1) {
          cart.items[itemIndex].quantity -= 1;
        } /*else {
          // If the quantity is 1, remove the item from the cart
          cart.items.splice(itemIndex, 1);
          res.redirect('/cart');
        }*/
      } else {
        // If the product does not exist in the cart, add it as a new item
        cart.items.push({
          product: product._id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          quantity: 1
        });
      }
    }

    // Save the cart to the database
    await cart.save();

    // Redirect to the cart page
    res.redirect('/cart');
  } catch (error) {
    console.log(error);
    res.render('error');
  }
});
router.delete('/cart/:id', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.session.userId });
    if (!cart) {
      return res.status(404).send('Cart not found');
    }

    const itemId = req.params.id;
    const itemIndex = cart.items.findIndex(item => item._id.equals(itemId));

    if (itemIndex === -1) {
      return res.status(404).send('Item not found in cart');
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.redirect('/cart');
  } catch (error) {
    console.log(error);
    res.render('error');
  }
});
router.post('/cart/:id', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.session.userId });
    if (!cart) {
      return res.status(404).send('Cart not found');
    }

    const itemId = req.params.id;
    const itemIndex = cart.items.findIndex(item => item._id.equals(itemId));
    if (itemIndex > -1) {
      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1;
        await cart.save();
      } else {
        cart.items.splice(itemIndex, 1);
        await cart.save();
      }
    }

    res.redirect('/cart');
  } catch (error) {
    console.log(error);
    res.render('error');
  }
});

const order = require("../models/order")
router.post('/place-order', ensureAuth, async (req, res) => {
  req.session.save();

  try {
    if (!req.session.passport.user) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const cart = await Cart.findOne({ userId:req.session.passport.user}).populate().lean();
    console.log('Cart:', cart);
    console.log('Session:', req.session);

    if (!cart || cart.items.length === 0) {
      return res.send('<script>alert("Cart is empty."); window.history.back();</script>');
    }

    const order1 = new order({
      userId: req.session.passport.user,
      items: cart.items,
    });

    await order1.save();
    await Cart.findOneAndUpdate({ userId: req.session.passport.user }, { items: [], total: 0 });
    
   return res.redirect('/udashboard');
   
  } catch (error) {
    console.error(error);
    return res.send('<script>alert("Error placing order."); window.history.back();</script>');
   // res.status(500).json({ message: 'Error placing order' });
  }
});


module.exports=router