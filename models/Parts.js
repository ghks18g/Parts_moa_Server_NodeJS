import mongoose from "mongoose";

const PartsSchema = new mongoose.Schema({
    id:{
        type:String,
        required: "Parts brand id is required"
    },
    ca_id:{
        type:String,
        required: "Parts category is required"
    },
    img: {
        type:String,
        required: "Image is required"
    },
    url: {
        type:String,
        required: "Url is required"
    },
    text: {
        type:String,
        required: "text is required"
    },
    price: {
        type:String,
        required: "price is required"
    }
});

module.exports = mongoose.model("Parts", PartsSchema);