require('dotenv').config();
const mysql = require('mysql');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306,
    multipleStatements: true, // Permite ejecutar múltiples queries
    connectTimeout: 10000 // Tiempo de espera antes de desconectar (10s)
};

let connection;

function handleDisconnect() {
    connection = mysql.createConnection(dbConfig);

    connection.connect((err) => {
        if (err) {
            console.error('Error al conectar con la base de datos:', err);
            setTimeout(handleDisconnect, 5000); // Reintentar después de 5s
        } else {
            console.log('Conectado a la base de datos.');
        }
    });

    connection.on('error', (err) => {
        console.error('Error en la conexión a la base de datos:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Intentando reconectar...');
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

module.exports = connection;