'use strict'

import { Server } from "socket.io"
import { createServer } from 'node:http'

//TODO: Aqui se manejaran los mensajes con sus rooms y nameSpaces
class SocketServer {
    constructor() {
        this.io;
        this.rooms;
        this.socketMap = new Map();
        this.namespace = 'myNamespace';

        if (this.io) {
            this.nsp = this.io.of(this.namespace);
        }
    }

    createServer = (app) => {
        const server = createServer(app)
        this.io = new Server(server, {
            connectionStateRecovery: {
                maxDisconnectionDuration: 200000
            }
        })

        return server;
    }

    manager = () => {
        this.io.on('connection', this.#onConnection);//Se conecto
    }

    //Los rooms son un arreglo de nombres de los diferentes rooms
    createRoom = ({ rooms }) => {
        if (!rooms) return false;

        rooms.forEach(room => {
            this.rooms[room] = true
        })

        return this.rooms;
    }

    #onConnection = (socket) => {
        console.log('Un usuario se acaba de conectar');
        this.#saveSocket(socket);
        socket.join(this.namespace);

        nsp.on('connection', this.#nspConnection);//Conecto a namespace
        socket.on('file', this.#manageFile);
        socket.on('broadcast message', this.#eventBroadcast);
        socket.on('message zone', this.#eventMessage);
        socket.on('direct message', this.#eventDirectMessage);

        socket.on('join_room', (room) => {
            socket.join(room)
            console.log(`El socket ${socket.id} se unio al room ${room}`);
        })

        socket.on('disconnect', this.#onDisconnect);

    }

    #nspConnection = (nspSocket) => {
        console.log(`El socket ${nspSocket} se conecto al nameSpace`);
    }

    //Enviar al namespace o algun room en especifico
    #manageFile = (data) => {
        const { destination, file, socket } = data;

        if (this.socketMap[socket]) {
            this.io.to(this.socketMap[socket])
            return true;
        }
        if (destination === this.namespace) {
            this.io.of(destination).emit('message', file);
            return true;
        }
        if (this.rooms[destination]) {
            this.io.of(destination).emit('message', file)
            return true;
        }

        return false;
    }

    #eventBroadcast = (data) => {
        const { namespace, message } = data;
        console.log(`Envias por el nameSpace ${namespace} el mensaje de ${message}`);
        this.io.of(namespace).emit('message', message);
        //Para emitir el mensaje a todos

    }

    #eventMessage = (data) => {
        const { room, message } = data
        console.log(`Envias por el room ${room} el mensaje de ${message}`);
        this.io.to(room).emit('message', message);
    }

    #eventDirectMessage = (data) => {
        const { socket, message } = data;

        console.log(`Envias al usuario ${socket} el mensaje de ${message}`);
        this.io.to(socket).emit('message', message);
    }
    #onDisconnect = () => {
        console.log('Un usuario se desconecto');
    }

    #saveSocket = (socket) => {
        const { user, profile } = socket.handshake

        this.socketMap.set(socket.id, user);
        console.log('Mapa', this.socketMap);
    }


}

export default SocketServer