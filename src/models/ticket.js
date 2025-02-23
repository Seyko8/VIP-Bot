const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'telegram_bot',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    retry: {
        max: 3
    }
});

const Ticket = sequelize.define('Ticket', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    threadId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('open', 'closed'),
        defaultValue: 'open'
    }
}, {
    tableName: 'Tickets'
});

(async () => {
    try {
        console.log('Attempting to connect to database...');
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        console.log('Syncing Tickets table...');
        await sequelize.sync();
        console.log('Database sync completed successfully.');
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
})();

module.exports = Ticket; 