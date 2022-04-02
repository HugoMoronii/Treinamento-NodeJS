const sequelize = require('sequelize');

const database = new sequelize({
    dialect: 'sqlite',
    storage: './database/storage/database.sqlite'  //caminho onde será salvo 
});

module.exports = database;