const Review = require("../models/review") ; 
const Listing = require("../models/listing") ; 

module.exports.createReview = async(req , res) => {
    let {id} = req.params ; 
    console.log(id) ; 
    let listing = await Listing.findById(id) ; 
    console.log(req.body.review) ;    
    let newReview = new Review(req.body.review) ; 
    newReview.author = req.user._id ; 
    listing.reviews.push(newReview) ; 
    await newReview.save() ; 
    await listing.save() ; 
    console.log("New review saved") ; 
    req.flash("success" , "New Review created") ; 
    res.redirect(`/listings/${id}`)  ;
} ; 

module.exports.destroyReview = async(req , res) => {
    let {id , reviewId} = req.params ; 
    await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId}}) ; 
    await Review.findByIdAndDelete(reviewId) ; 
    req.flash("success" , "Review deleted")
    res.redirect(`/listings/${id}`) ; 
} ; 