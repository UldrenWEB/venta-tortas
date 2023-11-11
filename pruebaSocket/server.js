import express from 'express'
import SocketServer from './clases/server.js'

const app = express();
const socketServer = new SocketServer(app);



// Crear el servidor HTTP y asociarlo con Socket.IO
const server = socketServer.returnServer();

// Iniciar el servidor Socket.IO
socketServer.manager();

// Crear una sala de chat
socketServer.createRoom({ rooms: ['chat', 'hola'] });

app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/index.html');
})


// Iniciar el servidor HTTP
server.listen(1234, () => {
    console.log('El servidor está escuchando en el puerto: http://localhost:1234');
});