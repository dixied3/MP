const Listing = require("../models/listing") ; 
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN ; 
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });



module.exports.index = async(req , res) => {    
    const allListings = await Listing.find() ; 
    res.render("listings/index.ejs" , {allListings}) ; 
} ; 


module.exports.renderNewForm =  (req , res) => {     
    res.render("listings/new.ejs") ; 
} ; 

module.exports.showListing = async(req , res) => {  
    let {id} = req.params ; 
    let l = await Listing.findById(id)
    // nested populate
    .populate({path : "reviews" , populate : {
        path : "author" , 
    }})
    .populate("owner") ; 
    if(!l) {
        req.flash("error" , "Listing does not exist") ; 
        res.redirect("/listings") ; 
    }
     
    res.render("listings/show.ejs" , {l}) ; 
} ; 

module.exports.createListing = async(req , res , next) => {   


    let response = await geoCodingClient.forwardGeocode({
        query: req.body.listing.location , 
        limit: 2
      })
        .send() ; 
    let url = req.file.path ; 
    let filename = req.file.filename ; 
    
    const newListing = new Listing(req.body.listing) ;
  
    console.log(req.user)
    console.log(req.user._id)
    newListing.owner = req.user._id ; 

    newListing.owner = req.user._id ; 
    newListing.image = {url , filename} ;
    newListing.geometry = response.body.features[0].geometry ; 
    let savedListing = await newListing.save() ; 
    
    // can be accessed from local variables 
    req.flash("success" , "New listing added successfully") ; 
    res.redirect("/listings") ;
   
    
} ; 


module.exports.renderEditForm = async(req , res) => {   
    let {id} = req.params ; 
    let doc = await Listing.findById(id) ; 
    if(!doc) {
        req.flash("error" , "Listing you requested for does not exist") ; 
        return res.redirect("/listings") ; 
    }

    let originalImageUrl = doc.image.url ; 
    originalImageUrl.replace("/upload" , "/upload/h_300,w_250") ; 

    res.render("listings/edit.ejs" , {id , doc , originalImageUrl}) ; 
} ; 

module.exports.updateListing = async(req , res) => {    
    let response = await geoCodingClient.forwardGeocode({
        query: req.body.listing.location , 
        limit: 2
      })
        .send() ; 
    let {id} = req.params ; 
    let listing = req.body.listing ; 
    console.log(listing) ; 
    let updatedListing = await Listing.findByIdAndUpdate(id , listing) ;
    updatedListing.geometry = response.body.features[0].geometry ; 
    if(typeof req.file !== "undefined") {
        let url = req.file.path ; 
        let filename = req.file.filename ;    
        updatedListing.image = {url , filename} ;
        await updatedListing.save() ; 
    }
    

    req.flash("success" , "Listing updated") ; 
    res.redirect(`/listings/${id}`) ;
    // res.send("Working") ; 
} ; 

module.exports.destroyListing = async(req , res) => {    
    let {id} = req.params ; 

    // middleware will get called (listing.js)
    let deleted = await Listing.findByIdAndDelete(id) ; 

    req.flash("success" , "Listing deleted successfully") ; 
   
    console.log(deleted) ; 
    res.redirect("/listings") ; 
} ; 