const mongoose =  require("mongoose");
const config = require("../config/db-config");

function connect() {
    return new Promise((connect, error) => {
        const DBURL = `mongodb://${config.HOST}/${config.DB}`
        mongoose.connect(DBURL,(err,connected)=>{
            if(err) return error(err);
            else if(connected) return connect("DataBase connected succuesfully")
        })
    })
    
};

module.exports = {connect};