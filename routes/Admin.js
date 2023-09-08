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
//const product = require("../models/product");


router.get("/admin/admindash",ensureAuth, async (req, res) => {
  res.render('admin/admindash');
}); 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/image/products');

    
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension); // generate a unique filename for the uploaded file
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: fileFilter
});

router.get('/admin/add-products', (req, res, next) => {
  console.log("n1")
  res.render('admin/add-products', {
    pageTitle: 'Add Product2',
    path: '/admin/add-products'
  });
});

router.post('/admin/add-products', upload.single('image'), (req, res, next) => {
  console.log("n2")
  const name = req.body.name;
  const imageUrl = '/image/products/' + req.file.filename;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    name: name,
    imageUrl: imageUrl,
    price: price,
    description: description
  });
  product.save()
    .then(result => {
      console.log('Product created!');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
});
router.get('/admin/products',ensureAuth,async (req, res)=>{
  try {
    const products = await Product.find();
    res.render('admin/products', { products });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
}
);
//router.get('/admin/products', getAllProducts);


router.delete("/admin/products/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    await Product.findByIdAndDelete(req.params.id)
    console.log("Product deleted.");
    res.redirect('admin/products');
  } catch (error) {
    console.log(error);
    res.render('error');
  }
}); 
router.get("/admin/edit/:id", ensureAuth,async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id });
    res.render('admin/edit', { product });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
}); 

router.post("/admin/products/:id", upload.single('image'), async (req, res) => {
  try {
    // Retrieve form data
    const { name, price, description } = req.body;
    
    // Process the uploaded image
//    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path; // get the path of the uploaded file
    } else {
      const product = await Product.findById(req.params.id);
      imageUrl = product.imageUrl; // keep the existing image if no new image is provided
    }

    // Update the product with the new image URL
    const product = await Product.findByIdAndUpdate(req.params.id, { name, price, description, imageUrl }, { new: true });
    res.redirect(`/admin/products`);
  } catch (error) {
    console.log(error);
    res.render('error');
  }
});
router.delete("/admin/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    // Delete the product from the database
    await Product.findByIdAndDelete(productId);

    res.sendStatus(204); // Send a success status code (204 - No Content) to indicate successful deletion
  } catch (error) {
    console.log(error);
    res.render('error');
  }
});
router.get("/admin/customers", ensureAuth, async (req, res) => {

  try {
    const customers = await Customer.find();
    res.render('admin/customers', { customers });
  } catch (error) {
    console.log(error);
    res.render('error');
  }

});

router.get("/admin/customer-edit/:id", async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id });
    res.render('admin/customer-edit', { customer });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
}); 
router.post("/admin/customers/:id",  async (req, res) => {

  try {
    const { name, email, address, phone } = req.body;
    const customer = await User.findByIdAndUpdate(req.params.id, { name, email, address, phone }, { new: true });
    res.redirect(`/admin/customers`);
  } catch (error) {
    console.log(error);
    res.render('error');
  }
});
const Order = require("../models/order");


router.get('/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate({ path: 'userId', select: 'name' }).populate('items.product');
    res.render("admin/orders", { orders });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
/*
// Update a product by ID
router.post("/admin/products/:id", async(req,res)=>{

  try {
    const { name, price, description, imageUrl } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { name, price, description, imageUrl }, { new: true });
    res.redirect(`/admin/products/${product._id}`);
  } catch (error) {
    console.log(error);
    res.render('error');
  }

});*/
//const methodOverride = require('method-override');

// Use method override middleware
//router.use(methodOverride('_method'));
// Delete a product by ID

/*


// Get a product by ID
router.get('/products/:id',(req,res)=>{
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.render('admin/product-details', { product });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};
});


// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customer');
    res.render('admin/orders', { orders, formatCurrency });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};

// Get an order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer');
    res.render('admin/order-details', { order, formatCurrency });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};

// Update an order status by ID
const updateOrderStatus = async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.redirect(`/admin/orders/${req.params.id}`);
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};

// Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.render('admin/customers', { customers });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};

// Get a customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    res.render('admin/customer-details', { customer });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};

// Update a customer by ID
const updateCustomer = async (req, res) => {
  try {
    const { name, email, address, phone } = req.body;
    const customer = await Customer.findByIdAndUpdate(req.params.id, { name, email, address, phone }, { new: true });
    res.redirect(`/admin/customers/${customer._id}`);
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};

// Create a new coupon
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountAmount } = req.body;
    const coupon = new Coupon({ code, discountType, discountAmount });
    await coupon.save();
    res.redirect('/admin/coupons');
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};

// Update a coupon by ID
const updateCoupon = async (req, res) => {
  try {
    const { code, discountType, discountAmount } = req.body;
    await Coupon.findByIdAndUpdate(req.params.id, { code, discountType, discountAmount });
    res.redirect('/admin/coupons');
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};

// Delete a coupon by ID
const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.redirect('/admin/coupons');
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};

// Get sales report
const getSalesReport = async (req, res) => {
  try {
    const orders = await Order.find();
    const report = {};
    orders.forEach(order => {
      const { status, total } = order;
      if (status === 'completed') {
        if (report[order.date]) {
          report[order.date] += total;
        } else {
          report[order.date] = total;
        }
      }
    });
    res.render('admin/sales-report', { report, formatCurrency });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};

// Get revenue report
const getRevenueReport = async (req, res) => {
  try {
    const orders = await Order.find();
    const report = {};
    orders.forEach(order => {
      const { status, total, discount } = order;
      if (status === 'completed') {
        if (report[order.date]) {
          report[order.date] += (total - discount);
        } else {
          report[order.date] = (total - discount);
        }
      }
    });
    res.render('admin/revenue-report', { report, formatCurrency });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};
*/
module.exports = router;