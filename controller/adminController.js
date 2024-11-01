const Admin = require('../model/admin');
const User = require('../model/user')
const bcrypt = require('bcrypt');
const Order = require('../model/order')
const moment = require('moment')

function getLogin(req, res) {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }

    let error 
    if(req.session.adminError){
         error =req.session.adminError
        delete req.session.adminError
    }else{
        error=''
    }
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.render('admin/login',{error});
}

async function getHome(req, res) {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            req.session.adminError = 'admin not found'
            return res.redirect('/admin/login')
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (isMatch) {
            req.session.admin = admin.id;
            return res.redirect('/admin/dashboard');
        } else {
            req.session.adminError = 'incorrect password'
            return res.redirect('/admin/login')
        }
    } catch (error) {
        console.error(error);
        return res.send('An error occurred');
    }
}

async function getUsers(req, res) {
    const user = await User.find()  
    res.render('admin/usersList',{user , currentPage:'users'})
}

async function changeUserStatus(req,res){
const { action, id } = req.params;
    
    try {
        const newStatus = action === 'list'; 

        const user = await User.findById(id)
        if(!user){
        res.status(406).json({ success:false , message: `User not found` });

        }
        const result=await User.findByIdAndUpdate(id, { status: newStatus });

        if(user.status===false){

            if(req.session.user && req.session.user === id.toString())
            delete req.session.user
        }

        if(result)
        res.status(200).json({ success:true , message: `User ${action === 'list' ? 'listed' : 'unlisted'} successfully.` });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error toggling product status.', error });
    }
}

function getLogout(req,res){
    if(req.session.admin){
        delete req.session.admin
        return res.redirect('/admin/login');
      }else{
        return res.redirect('/user/profile');
      }
}

const getTopSellingCategories = async () => {
    try {
        const topCategories = await Order.aggregate([
            { $match: { orderStatus: 'Delivered' } }, 
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category",
                    totalQuantity: { $sum: "$items.quantity" },
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            {
                $project: {
                    categoryName: "$categoryDetails.name",
                    categoryImage: "$categoryDetails.imageUrl",
                    totalQuantity: 1
                }
            }
        ]);
        return topCategories;
    } catch (error) {
        console.error("Error fetching top-selling categories:", error);
        throw error;
    }
};



const getTopSellingProducts = async () => {
    try {
        const topProducts = await Order.aggregate([
            { $match: { orderStatus: 'Delivered' } }, 
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    totalQuantity: { $sum: "$items.quantity" },
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    productName: "$productDetails.name",
                    productImage: { $arrayElemAt: ["$productDetails.imageUrls", 0] },
                    totalQuantity: 1
                }
            }
        ]);
        return topProducts;
    } catch (error) {
        console.error("Error fetching top-selling products:", error);
        throw error;
    }
};



async function getDashboard(req, res) {
    try {
        const users = await User.countDocuments();
        const totalOrders = await Order.countDocuments();

        const deliveredOrders = await Order.find({ orderStatus: 'Delivered' });
        const totalSalesAmount = deliveredOrders.reduce((total, order) => total + order.totalAmount, 0);
        const totalPendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });


        const topProducts = await getTopSellingProducts();
        const topCategories = await getTopSellingCategories();

        console.log(topProducts,topCategories);
        
        const salesData = {
            weekly: await getSalesData('week'),
            monthly: await getSalesData('month'),
            yearly: await getSalesData('year'),
        };

        res.render('admin/dashboard', {
            users,
            totalOrders,
            totalSalesAmount,
            totalPendingOrders,
            salesData,
            topProducts,
            topCategories,
            currentPage:'dashboard'
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function getSalesData(period) {
    const startDate = moment().startOf(period).toDate();
    const endDate = moment().endOf(period).toDate();

    const orders = await Order.find({
        orderStatus: 'Delivered',
        createdAt: { $gte: startDate, $lte: endDate }
    });

    const sales = {};
    orders.forEach(order => {
        const dateKey = moment(order.createdAt).format(period === 'year' ? 'YYYY' : period === 'month' ? 'MMM YYYY' : 'dddd');
        sales[dateKey] = (sales[dateKey] || 0) + order.totalAmount;
    });

    return sales;
}

module.exports = {
    getLogin,
    getHome,
    getUsers,
    changeUserStatus,
    getLogout,
    getDashboard
};
