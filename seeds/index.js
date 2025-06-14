// if(process.env.NODE_ENV !== "production"){
//     require("dotenv").config();
// }

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
//mmmmmmm

// const maptilerClient = require("@maptiler/client");
// maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY; // replace this with actual kley 

console.log("lllllllllllllllllllll",process.env.MAPTILER_API_KEY)

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 10; i++) {
        const random50 = Math.floor(Math.random() * 50);

        // const geoData = await maptilerClient.geocoding.forward(`${cities[random50].city}, ${cities[random50].state}`, { limit: 1 });

        const camp = new Campground({
            location: `${cities[random50].city}, ${cities[random50].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.",
            price: Math.floor(Math.random() * 20) + 100,
            author: "68373651143d1dbb9a1ac629",

            // geometry: geoData.features[0].geometry,
            geometry: {
                type: "Point",
                coordinates: [cities[random50].longitude, cities[random50].latitude]
            },

            images: [
                {
                    url: 'https://res.cloudinary.com/dnmguhtpt/image/upload/v1749654264/Yelp-camp/mofysrwxiuku9fy7cfrv.png',
                    filename: 'Yelp-camp/mofysrwxiuku9fy7cfrv'
                },
                {
                    url: 'https://res.cloudinary.com/dnmguhtpt/image/upload/v1749654264/Yelp-camp/zzmnldqhh03awy1s7elo.png',
                    filename: 'Yelp-camp/zzmnldqhh03awy1s7elo'
                },
                {
                    url: 'https://res.cloudinary.com/dnmguhtpt/image/upload/v1749654265/Yelp-camp/nxe7ttlr7v9s2ihdk7eb.png',
                    filename: 'Yelp-camp/nxe7ttlr7v9s2ihdk7eb'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})



// image: `https://picsum.photos/400/300`