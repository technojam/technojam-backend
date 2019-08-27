const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dbconfig = require('./config/database')

mongoose.connect(dbconfig.database);
let db = mongoose.connection;
// Establish connections
db.once('open', ()=> {
 console.log("Database connnected")
});
// Checks if there is error in database connection
db.on('error', (err)=> {
console.log(err);
});
app.listen(3000, function(){
    console.log("Welcome to Technojam Backend server.")
})
// Sample routes
app.get('/', ()=> {
    console.log("Sample home route")
})
