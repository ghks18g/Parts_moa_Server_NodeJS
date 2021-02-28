import mongoose from "mongoose";

const LikeItemsSchema = new mongoose.Schema({
    useremail: {
        type:String
    },
    likeItem: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Parts"
    },
    itemurl:  {
        type:String
    },
});

module.exports = mongoose.model("LikeItems", LikeItemsSchema);
