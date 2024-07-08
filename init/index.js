const mongoose = require('mongoose') ; 
const initData = require('./data.js') ; 
const Listing = require("../models/listing.js") ;


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"
main().then(() => {
    console.log("Connected to database successfully") ; 
}).catch((err) => {
    console.log("some error occoured") ; 
    console.log(err) ; 

})

async function main() {
    await mongoose.connect(MONGO_URL) ; 
}

const initDB = async() => {
    //to clean already present data . 
    await Listing.deleteMany({}) ; 
    initData.data = initData.data.map((obj) => ({...obj , owner : "6665ba75410316254ea8d084"}))
    await Listing.insertMany(initData.data) ;
    console.log("Data was initialized") ; 

} ; 

initDB() ; 