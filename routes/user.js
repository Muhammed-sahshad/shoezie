const express = require('express')
const router = express.Router()
const {addUser,getSignup,getLogin,getHome,getShop,getProduct,sortProducts,
userLogIn,verifyOtp,getOtpPage,resendOtp,forgotPassword,sendOtp,
forgotPasswordVerifyOtp,resetPassword,forgotPasswordResendOtp} = require('../controller/userController')

 const{getProfile,userLogOut,
    getAddress,getOrders,getOrderDetails,
    updateUserDetails,addAddress,
    updateAddress,deleteAddress, } = require('../controller/userProfileController')   

const { userAuthenticated,preventCache} = require('../middleware/authMiddleware')

const {getCart,getCheckout,addProductToCart,
    removeProductFromCart,updateProductQuantity} = require('../controller/cartController')

const { createOrder,cancelOrder,updateOrderStatus,ordercreated,returnOrder,downloadInvoice} = require('../controller/orderController')

const {validateCoupon} = require('../controller/coupon')

const {getWallet} = require('../controller/wallet')

const {
getWishlist,
addProductToWishlist,
deleteProductFromWishlist
} = require('../controller/whishlistController')

router.get('/login',getLogin)
router.post('/login',preventCache,userLogIn)
router.get('/forgot-password',forgotPassword)
router.post('/forgot-password/send-otp',sendOtp)
router.post('/forgot-password/resend-otp',forgotPasswordResendOtp)
router.post('/forgot-password/verify-otp',forgotPasswordVerifyOtp)
router.post('/forgot-password/reset',resetPassword)

router.get('/profile',userAuthenticated,getProfile)
router.put('/profile/update',updateUserDetails)

router.get('/profile/address',userAuthenticated,getAddress)
router.post('/profile/address/add',addAddress)
router.post('/profile/address/update',updateAddress)
router.delete('/profile/address/delete/:addressId',deleteAddress)

router.get('/profile/orders',userAuthenticated,getOrders)
router.get('/profile/orders/:orderId',userAuthenticated,getOrderDetails)
router.patch('/profile/orders/cancel/:orderId',cancelOrder)
router.patch('/profile/order/repay/:orderId',updateOrderStatus)
router.post('/profile/order/return/:orderId',returnOrder)
router.get('/profile/order/invoice/:orderId',downloadInvoice)

router.get('/signup',getSignup)
router.post('/register',addUser)
router.get('/verify-otp',getOtpPage)
router.post('/verify-otp',verifyOtp)
router.post('/resend-otp',resendOtp)

router.get('/home',getHome)
router.get('/shop',getShop)
router.get('/shop/filter',sortProducts)
router.get('/shop/:id',getProduct)

router.get('/cart',userAuthenticated,getCart)
router.get('/cart/checkout',userAuthenticated,getCheckout)
router.post('/cart/checkout/confirm-order',createOrder)
router.patch('/cart/checkout/update-order/:orderId',updateOrderStatus)
router.get('/cart/checkout/order-created/:orderId',ordercreated)

router.post('/cart/add/:productId/:sizeId',addProductToCart)
router.delete('/cart/remove/:productId',removeProductFromCart)
router.put('/cart/update/:productId',updateProductQuantity)
router.post('/cart/coupon/validate',validateCoupon)

router.get('/wishlist',userAuthenticated,getWishlist)
router.post('/wishlist/add',addProductToWishlist)
router.delete('/wishlist/delete',deleteProductFromWishlist)

router.get('/profile/wallet',userAuthenticated,getWallet)

router.get('/logout',userLogOut)
module.exports = router