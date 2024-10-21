const Wishlist = require('../model/wishlist')

async function getWishlist(req,res){
    const userId = req.session.user

    try {
        let wishlist = await Wishlist.findOne({user:userId}).populate('items.productId')

        if(!wishlist){
            const newWishlist = new Wishlist({
                user:userId,
                items: []
            })
            await newWishlist.save()
            wishlist = newWishlist
        }
        res.render('user/wishlist',{wishlist})

    } catch (error) {
        console.log(error);  
    }
}

async function addProductToWishlist(req,res){
    const userId = req.session.user
    const {productId }=req.body
    
    try {
        let wishlist = await Wishlist.findOne({user:userId})

        if(!wishlist){
            wishlist = new Wishlist({
                user:userId,
                items: []
            })
            await wishlist.save()
        }

        const productExists = wishlist.items.some(item =>
            item.productId.toString() === productId 
        );

        if (productExists) {
            return res.json({ success: false, message: 'Product already in wishlist' });
        }

        // Add the product to the wishlist
        wishlist.items.push({ productId });

        // Save the updated wishlist
        await wishlist.save();

        res.json({ success: true, message: 'Product added to wishlist' });

        
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function deleteProductFromWishlist(req,res){
    const { itemId } = req.body;
console.log(itemId);

    try {
        const wishlist = await Wishlist.findOne({ 'items._id': itemId });

        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Item not found in wishlist' });
        }

        wishlist.items = wishlist.items.filter((item) => item._id.toString() !== itemId);
        await wishlist.save();

        res.json({ success: true, message: 'Item removed from wishlist' });
    } catch (error) {
        console.error('Error removing wishlist item:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }

}

module.exports = {
    getWishlist,
    addProductToWishlist,
    deleteProductFromWishlist
}