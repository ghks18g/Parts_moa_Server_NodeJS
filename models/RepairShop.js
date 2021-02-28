import mongoose from "mongoose";

const RepairShopSchema = new mongoose.Schema({
    name: {
        type:String
    },
    rdnmadr:  {
        type:String
    },
    lnmadr: {
        type:String
    },
    lat: {
        type:String
    },
    lng: {
        type:String
    },
    phone: {
        type:String
    },
    openTime:  {
        type:String
    },
    closeTime: {
        type:String
    }
});

module.exports = mongoose.model("RepairShop", RepairShopSchema);