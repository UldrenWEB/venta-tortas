'use strict'

import { Server } from "socket.io"
import { createServer } from 'node:http'

//TODO: Aqui se manejaran los mensajes con sus rooms y nameSpaces
class SocketServer {
    constructor(app) {
        this.io;
        this.rooms = {};
        this.socketMap = new Map();
        this.namespace = 'myNamespace';
        this.server = this.#createServer(app);
        this.createNsp(this.io)
    }

    #createServer = (app) => {
        const server = createServer(app)
        this.io = new Server(server, {
            connectionStateRecovery: {
                maxDisconnectionDuration: 200000
            }
        })

        return server;
    }

    returnServer = () => this.server;
    createNsp = (io) => {
        return io.of(this.namespace)
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
        this.#saveSocket(socket);

        console.log('Un usuario se acaba de conectar', this.socketMap.has(socket.id));

        socket.on('file', this.#manageFile);
        socket.on('general message', this.#eventBroadcast);
        socket.on('message zone', this.#eventMessage);
        socket.on('direct message', this.#eventDirectMessage);

        socket.on('join_namespace', (namespace) => {
            socket.join(namespace);
            console.log(`El socket ${socket.id} se conecto al nameSpace`);
        });
        socket.on('join_room', (room) => {
            socket.join(room)
            console.log(`El socket ${socket.id} se unio al room ${room}`);
        })

        socket.on('disconnect', this.#onDisconnect);

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
        if (this.namespace === namespace) {
            return this.io.to(namespace).emit('broadcast message', message);
        }
        return console.log('Es incorrecto el nameSpace, verifique');
        //Para emitir el mensaje a todos

    }

    #eventMessage = (data) => {
        const { room, message } = data
        console.log(`Envias por el room ${room} el mensaje de ${message}`);
        this.io.to(room).emit('room message', message);
    }

    #eventDirectMessage = (data) => {
        const { user, message } = data;
        const socketReceived = this.socketMap.get(user)
        if (!socketReceived) {
            console.log('No se encontro ese usuario');
        }
        console.log(`Envias al usuario ${user} el mensaje de ${message}`);
        this.io.to(socketReceived).emit('direct message', message);
    }
    #onDisconnect = () => {
        console.log('Un usuario se desconecto');
    }

    #saveSocket = (socket) => {
        const { user, email } = socket.handshake.query;
        console.log(`--> ${user}`);
        this.socketMap.set(user, socket.id);
    }


}

export default SocketServer