const mongoose = require('mongoose');
const {v4 : uuidv4 } = require('uuid')

const orderSchema = new mongoose.Schema({
    orderId:{
        type:String,
        required:true,
        unique:true,
        default: uuidv4,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', 
                required: true
            },
            sizeId:{
                type: mongoose.Schema.Types.ObjectId,
                required:true
            },
            offerId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Offer'
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    offerDiscount:{
        type:Number
    },
    couponDiscount:{
        type:Number
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Returned', 'Shipped', 'Delivered', 'Cancelled','Failed'],
        default: 'Pending'
    },
    shippingAddress: {
        fullname: { type: String, required: true },
        address: { type: String, required: true },
        pincode: { type: String, required: true },
        phone: { type: String, required: true }
    },
    paymentMethod :{
        type:String,
        required:true
    },
    paymentStatus:{
        type:String,
        required:true  
    },
    orderDate:{
        type:Date,
        default:Date.now
    },
    return: { 
        reason: String,
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
        },
        refundStatus: {
            type: String,
            enum: ['Pending', 'Completed'],
        },
        adminComments: String, 
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin' 
        },
        requestedAt: Date,
        processedAt: Date
    }
},{timestamps:true});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
