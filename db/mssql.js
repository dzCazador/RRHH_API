const sql = require('mssql');

const config = {
    user: 'ess',
    password: 'ess',
    server: 'localhost',
    database: 'Rhpro_Cervi',
    options: {
        encrypt: false   // Si estás usando Azure
    }
};

async function connectToDatabase() {
    try {
        await sql.connect(config);
        console.log('Connected to SQL Server');
    } catch (error) {
        console.error('Error connecting to SQL Server:', error);
    }
}

module.exports = {
    sql,
    connectToDatabase
};

