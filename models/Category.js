const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    title:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Course"
    }
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;