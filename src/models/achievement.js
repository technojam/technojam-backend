const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    aid: {
		type: String,
		required: true,
		unique: true
    },
    title: {
        type: String,
    },
    description:{
        type: String,   
    },
    date: {
        type: String
    },
    image:{
        type:String
    }
})


module.exports = mongoose.model('Achievements', achievementSchema);
