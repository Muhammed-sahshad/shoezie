const express = require('express');
const router = express.Router();

const {
    getLogin, getHome, getUsers,changeUserStatus,getLogout
} = require('../controller/adminController');

const { getProducts,addProduct,addUpload,editUpload,
    editProduct,changeProductStatus } = require('../controller/productController')

const {getCategory,addCategory,uploadCategory,changeCategoryStatus} = require('../controller/categoryController')

const { isAuthenticated } = require('../middleware/authMiddleware');


router.get('/login', getLogin);
router.post('/login', getHome);

router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('admin/dashboard')});

router.get('/users', isAuthenticated, getUsers);
router.patch('/users/:action/:id',changeUserStatus)

router.get('/products',  getProducts);
router.post('/products/add',addUpload,addProduct)
router.post('/products/edit',editUpload,editProduct)
router.patch('/products/:action/:id',changeProductStatus)

router.get('/category', isAuthenticated, getCategory);
router.post('/category/add',uploadCategory,addCategory)
router.patch('/category/:action/:id',changeCategoryStatus)

router.get('/logout',getLogout)

module.exports = router;
