const mongoose = require('mongoose');

function dbConnection() {
    mongoose.connect(process.env.DB_URL +'/'+ process.env.DB_NAME)
        .then(console.log('Database Connected.'))
        .catch((error) => console.log('Error in database connection: ' + error));
}

module.exports = dbConnection;