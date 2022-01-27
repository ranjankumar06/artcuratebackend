const Product = require('../modules/product/models');
const Review = require('../modules/review/models');

const products = {
    deleteProductDetails: (req, res, next) => {
        const productId = req.params.id;
        Product.Details.findByIdAndDelete(productId, (err, data) => {
            if (err) {
                res.send(err.message);
            } else {
                next();
            }
        })
    },
    deleteProductReview: (req, res, next) => {
        const productId = req.params.id;
        Review.Comment.findByIdAndDelete(productId, (err, data) => {
            if (err) {
                res.send(err.message);
            } else {
                next();
            }
        })
    }
};

module.exports = products;