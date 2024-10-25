const User = require('../model/user')
const Address = require('../model/address')
const Order = require('../model/order')

async function getProfile(req,res){
    const _id = req.session.user

 const user=await User.findOne({_id})
 
   res.render('user/profile',{user})
}
async function getAddress(req,res){
    const userId = req.session.user
    const user = await User.findById(userId)
    const address = await Address.find({user:userId})
  
    res.render('user/address',{address,user})
}

async function getOrders(req,res){
  const userId = req.session.user
  try { 
    const user = await User.findById(userId) 
    const order = await Order.find({userId}).sort({createdAt:-1}).populate('items.productId')
    if(!order){
      throw new Error('Order not found')
    }
    res.render('user/order',{order,user})
  } catch (error) {
    console.log(error)
  }
    
}

async function getOrderDetails(req, res) {
  const { orderId} = req.params; 
  try {
      const order = await Order.findById(orderId).populate('items.productId')

      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }
      
      res.render('user/orderDetails', { order });
  } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}


function userLogOut(req,res){
  
      if(req.session.user){
        delete req.session.user
        return res.redirect('/user/login');
      }else{
        return res.redirect('/user/profile');
      }
}

async function updateUserDetails(req,res){

    const userId = req.session.user  
    const { firstname, lastname, email, phone } = req.body; 
    try {
      if (!firstname || !lastname || !email) {
        return res.status(400).json({ error: 'First name, last name, and email are required.' });
      }
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          firstname,
          lastname,
          email,
          phone
        },
        { new: true, runValidators: true } 
      );
        if (!updatedUser) {
        return res.status(404).json({ error: 'User not found.' });
      }
      return res.status(200).json({ message: 'User details updated successfully', user: updatedUser });
  
    } catch (error) {
      return res.status(500).json({ error: 'Something went wrong, please try again.' });
    }
}

async function addAddress(req,res){
 const {fullname, phoneNumber, pincode, address,
     city, district, state, country, type  } = req.body

     const userId = req.session.user
     try {  
        // Create a new address instance
        const newAddress = new Address({
            user: userId, 
            fullname,
            phoneNumber,
            pincode,
            address,
            city,
            district,
            state,
            country,
            type
        }); 
         await newAddress.save();

         return res.status(201).redirect('/user/profile/address')
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error adding address', error });
        }
}

async function updateAddress(req,res){
    const {fullname, phoneNumber, pincode, address,
        city, district, state, country, type ,addressId } = req.body;
  const updatedData ={fullname, phoneNumber, pincode, address,
    city, district, state, country, type }
try {
    const updatetdAddress = await Address.findByIdAndUpdate( addressId ,
        updatedData, {new:true , runValidators:true}
     ) 
     if(updateAddress){
     return res.status(201).redirect('/user/profile/address')
     }

    } catch (error) {
    console.log(error); 
    return res.status(500).json({ message: 'Error editing address', error });  
    }       
}

async function deleteAddress(req, res) {
  const { addressId } = req.params;
  
  try {
    const result = await Address.findByIdAndDelete(addressId);
    
    if (!result) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}


module.exports = {
    getProfile,userLogOut,
    getAddress,getOrders,getOrderDetails,
    updateUserDetails,addAddress,updateAddress,deleteAddress,
}