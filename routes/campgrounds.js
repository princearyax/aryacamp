const express = require("express");
const router = express.Router();
const catchAsync = require("../utilities/catchAsync");  //wrapAsync fun
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware.js");
const campgrounds = require("../controllers/campgrounds.js");

const multer = require("multer");
const { storage } = require("../cloudinary"); //node automaticcally looks for index
// const upload = multer( { dest: "uploads/" } );
const upload = multer( { storage } );


router.route("/")
    .get(catchAsync(campgrounds.index))
    //upload an array(multiple iamges) under the key in the form data image
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));
    // .post(upload.array("image"), (req, res) => {
    //     res.send("work");
    //     console.log("req.files: ", req.files);
    //     console.log("req.body: ", req.body);
    // });

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));
// router.get("/:id", async (req, res) => {
//     const campground = await Campground.findById(req.params.id);
//     res.render("campgrounds/show.ejs", { campground });
// });

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
