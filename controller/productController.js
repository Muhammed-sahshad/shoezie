const Product = require('../model/product')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const multer = require('multer')
require('dotenv').config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const upload = multer({ dest: 'uploads/' });

async function getProducts(req, res) {

    try {
        const product =await Product.find({})
        res.render('admin/products',{product})

    } catch (error) {
        
    }
}

// async function addProduct(req,res){
//     const  { productName, productDescription,
//  productPrice, productCategory, productStock } = req.body;


 
//     try {
//         const newProduct = new Product({
//           name: productName,
//           description: productDescription,
//           price: productPrice,
//           category: productCategory,
//           stock: productStock
//         });
        
//         await newProduct.save();
//        return res.redirect('/admin/products')
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }

// }



// const addProduct = (req, res) => {
//     const { productName, productDescription, productCategory, productPrice, productStock } = req.body;
// console.log(req.files);

//     if (!req.files) {
//         return res.status(400).json({ message: 'No image uploaded' });
//     }

//     // Create a stream from the buffer
//     const stream = cloudinary.uploader.upload_stream(
//         { folder: 'product' }, // Specify the folder in Cloudinary
//         async (error, result) => {
//             if (error) {
//                 return res.status(500).json({ message: 'Error uploading to Cloudinary', error });
//             }

//             // Create a new product document
//             const newProduct = new Product({
//                 name: productName,
//                 description: productDescription,
//                 category: productCategory,
//                 price: productPrice,
//                 stock: productStock,
//                 imageUrl: result.secure_url,
//             });

//             try {
//                 // Save the product to the database
//                 await newProduct.save();
//                 // res.status(200).json({
//                 //     message: 'Product added successfully!',
//                 //     imageUrl: result.secure_url,
//                 // });
//                 return res.redirect('/admin/products')
//             } catch (dbError) {
//                 console.error(dbError);
//                 res.status(500).json({ message: 'Error saving product to database', dbError });
//             }
//         }
//     );

//     // Stream the buffer to Cloudinary
//     streamifier.createReadStream(req.files.buffer).pipe(stream);
// };

 async function deleteProduct (req, res){
    const productId = req.params.id;
    try {
        await Product.findByIdAndDelete(productId); // Adjust based on your database setup
        res.status(200).send({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send({ message: 'Failed to delete product' });
    }
}


const addProduct = (req, res) => {
    const { productName, productDescription, productCategory, productPrice, productStock } = req.body;
console.log(req.files);
console.log(req.body);


    if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: 'No images uploaded' });
    }

    const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'product' }, // Specify the folder in Cloudinary
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result.secure_url); // Resolve with the secure URL
                }
            );

            streamifier.createReadStream(file.buffer).pipe(stream);
        });
    });

    Promise.all(uploadPromises)
        .then(async (imageUrls) => {
            // Create a new product document
            const newProduct = new Product({
                name: productName,
                description: productDescription,
                category: productCategory,
                price: productPrice,
                stock: productStock,
                imageUrls, // Save the array of image URLs
            });

            try {
                // Save the product to the database
                await newProduct.save();
                return res.redirect('/admin/products'); // Redirect after success
            } catch (dbError) {
                console.error(dbError);
                return res.status(500).json({ message: 'Error saving product to database', dbError });
            }
        })
        .catch(uploadError => {
            console.error(uploadError);
            return res.status(500).json({ message: 'Error uploading images to Cloudinary', uploadError });
        });
};

async function editProduct(req,res){

        const { id, name, description, category, price, stock, newImages } = req.body;

    try {
        // Find the product by ID
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Create an object to hold the updates
        const updates = {};

        // Check for changes in the product details
        if (name && name !== product.name) updates.name = name;
        if (description && description !== product.description) updates.description = description;
        if (category && category !== product.category) updates.category = category;
        if (price && price !== product.price) updates.price = price;
        if (stock && stock !== product.stock) updates.stock = stock;

        // Handle new image uploads
        if (newImages && newImages.length > 0) {
            const uploadPromises = newImages.map(image => {
                return cloudinary.uploader.upload(image, {
                    folder: 'products', // optional: specify a folder
                });
            });

            // Wait for all images to upload
            const uploadResponses = await Promise.all(uploadPromises);

            // Extract the URLs from the upload responses
            const imageUrls = uploadResponses.map(response => response.secure_url);

            // Add the new image URLs to the existing ones
            updates.imageUrls = [...product.imageUrls, ...imageUrls];
        }

        // Update the product
        await Product.findByIdAndUpdate(id, updates, { new: true });

        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating product', error });
    }
        
}

module.exports = {
    getProducts,addProduct, upload: upload.array('productImage[]'),deleteProduct,editProduct
}