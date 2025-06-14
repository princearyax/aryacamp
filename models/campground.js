const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const { required } = require("joi");
const { coordinates } = require("@maptiler/client");

// https://res.cloudinary.com/dnmguhtpt/image/upload/w_200/v1749646370/Yelp-camp/ske3uwjk67qjomimmarb.png


const ImageSchema = new Schema(
    {
        url: String,
        filename: String
    }
);
ImageSchema.virtual("thumbnail").get(function() {
    return this.url.replace("/upload", "/upload/w_200");
});


const opts = { toJSON: { virtuals: true }};
const CampgroundSchema = new Schema({
    title:{
        type: String
    },
    price : Number,
    description : String,
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location : String,
    images: [ImageSchema],
    author : {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts);
//to like nest something
CampgroundSchema.virtual("properties.popUpMarkup").get(function(){
    return `<a href="/campgrounds/${this._id}">${this.title}</a>
    <p>${this.description.substring(0, 30)}...</p>`;
});

//triggered by findByIdAndDelete
CampgroundSchema.post("findOneAndDelete", async(doc)=>{
     if(doc){
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
     }
});

module.exports = mongoose.model("Campground", CampgroundSchema);