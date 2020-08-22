/*SERVIDOR*/
'use strict'

// Cargar modulos de node para crear servidor
var express = require('express');
var bodyParser = require('body-parser');

// Ejecutar express (http)
var app = express();

// cargar file rutas
var article_routes = require('./routes/article');


// Middlewares
//permitir datos desde forms en formato json
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());

// CORS
//acceso cruzado entre dominios - para permitir llamadas http desde cualquier frontend (desde cualquier otra IP)
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


// Añadir prefijos a rutas / cargar rutas
app.use('/api/blog', article_routes)


//Exportar modulo (fichero actual)
module.exports = app;
