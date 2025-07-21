const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejo de preflight OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream('index.html').pipe(res);
    }

    else if (req.method === 'POST' && req.url === '/api/contacto') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.log('POST recibido:', data);
                res.writeHead(201, { 'Content-Type': 'application/json' }); // Código 201: creado
                res.end(JSON.stringify({ message: 'Formulario recibido (POST)' }));
            } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Datos mal formateados' }));
            }
        });
    }

    else if (req.method === 'PUT' && req.url === '/api/contacto') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.log('PUT recibido:', data);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Datos actualizados (PUT)' }));
            } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Datos mal formateados' }));
            }
        });
    }

    else if (req.method === 'PATCH' && req.url === '/api/contacto') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.log('PATCH recibido:', data);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Datos parcialmente actualizados (PATCH)' }));
            } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Datos mal formateados' }));
            }
        });
    }

    else if (req.method === 'DELETE' && req.url === '/api/contacto') {
        console.log('DELETE recibido');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Datos eliminados (DELETE)' }));
    }

    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(3000, () => {
    console.log("Servidor Node.js escuchando en el puerto 3000");
});
