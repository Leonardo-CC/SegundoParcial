const http = require("http");
const fs = require("fs");
const { Pool } = require("pg");

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Contactos',
    password: '123456',
    port: 5432
});

const server = http.createServer((req, res) => {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Preflight para CORS
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
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { nombre, email, mensaje } = data;

                if (!nombre || !email || !mensaje) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Todos los campos son obligatorios' }));
                    return;
                }

                const query = 'INSERT INTO mensajes (nombre, email, mensaje) VALUES ($1, $2, $3)';
                await pool.query(query, [nombre, email, mensaje]);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: '✅ Formulario recibido y guardado en la base de datos' }));
            } catch (err) {
                console.error('❌ Error en POST:', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error interno del servidor' }));
            }
        });
    }

    else if (req.method === 'PUT' && req.url === '/api/contacto') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { id, nombre, email, mensaje } = data;

                if (!id || !nombre || !email || !mensaje) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Todos los campos son obligatorios (PUT)' }));
                    return;
                }

                const query = 'UPDATE mensajes SET nombre=$1, email=$2, mensaje=$3 WHERE id=$4';
                const result = await pool.query(query, [nombre, email, mensaje, id]);

                if (result.rowCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No se encontró el mensaje con ese ID' }));
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: '✅ Mensaje actualizado completamente (PUT)' }));
            } catch (err) {
                console.error('❌ Error en PUT:', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al actualizar' }));
            }
        });
    }

    else if (req.method === 'PATCH' && req.url === '/api/contacto') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { id, nombre, email, mensaje } = data;

                if (!id) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'El ID es obligatorio para PATCH' }));
                    return;
                }

                // Crear consulta dinámica según campos enviados
                const fields = [];
                const values = [];
                let paramIndex = 1;

                if (nombre) {
                    fields.push(`nombre=$${paramIndex++}`);
                    values.push(nombre);
                }
                if (email) {
                    fields.push(`email=$${paramIndex++}`);
                    values.push(email);
                }
                if (mensaje) {
                    fields.push(`mensaje=$${paramIndex++}`);
                    values.push(mensaje);
                }

                if (fields.length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No se enviaron campos para actualizar' }));
                    return;
                }

                const query = `UPDATE mensajes SET ${fields.join(', ')} WHERE id=$${paramIndex}`;
                values.push(id);

                const result = await pool.query(query, values);

                if (result.rowCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'ID no encontrado para PATCH' }));
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: '🔧 Mensaje parcialmente actualizado (PATCH)' }));
            } catch (err) {
                console.error('❌ Error en PATCH:', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error en la actualización parcial' }));
            }
        });
    }

    else if (req.method === 'DELETE' && req.url === '/api/contacto') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { id } = data;

                if (!id) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'El ID es obligatorio para DELETE' }));
                    return;
                }

                const result = await pool.query('DELETE FROM mensajes WHERE id = $1', [id]);

                if (result.rowCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'ID no encontrado' }));
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: '🗑️ Mensaje eliminado correctamente (DELETE)' }));
            } catch (err) {
                console.error('❌ Error en DELETE:', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al eliminar el mensaje' }));
            }
        });
    }

    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(3000, () => {
    console.log("🚀 Servidor Node.js escuchando en el puerto 3000");
});
