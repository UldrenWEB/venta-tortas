'use strict'

// import { io } from 'socket.io-client'
// import FileReader from 'filereader';
// import random from 'random-name'
// import { Chance } from "chance"; 


//*Cuando se instacie se tienen que pasar los rooms y los namespace disponibles
class Client {
    constructor({ io, url, rooms }) {
        this.rooms = rooms
        this.url = url;
        this.io = io;
        this.namespace = 'myNamespace';
    }
    //Crea el socket del cliente que se conecto
    createSocketClient = (person) => {
        const socket = this.io(this.url, {
            query: {
                user: person.user,
                email: person.email
            }
        })
        if (person.user === 'Uldren') this.#joinRoom(socket, 'hola')

        console.log('Esto se deberia ejecutar', socket);
        return socket;
    }
    joinNamespace = (socket) => {
        socket.emit('join_namespace', this.namespace);
    }
    #joinRoom = (socket, room) => {
        if (!this.rooms[room]) {
            return console.error(`La sala ${room} no existe o no esta disponible`);
        }
        socket.emit('join_room', room)
    }

    // Envía un mensaje a un room dentro de un namespace
    sendMessage = ({ socket, room, message }) => {
        if (!this.rooms[room]) {
            return console.error(`La sala ${room} no existe o no esta disponible`);
        }
        socket.emit('message zone', { room, message });
    }

    sendMessageBroadcast = ({ socket, message }) => {
        const namespace = 'myNamespace'
        socket.emit('general message', { namespace, message })
    }

    // Envía un mensaje directo a un usuario
    sendDirectMessage = ({ socketEmit, user, message }) => {
        socketEmit.emit('direct message', { user, message });
    }

    // Carga un archivo al servidor
    uploadFile = ({ socket, file, destination }) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            socket.emit('file', { file: evt.target.result, destination, socket });
        };
        reader.onerror = (error) => {
            console.log('Error al leer el archivo:', error);
        };
        reader.readAsDataURL(file);
    }

    // Carga una imagen al servidor
    loadImage = ({ socket, file, namespaceOrRoom = 'myNamespace' }) => {
        this.uploadFile({
            socket: socket,
            file: file,
            destination: namespaceOrRoom,
            socket: socket
        });
    }

    // Carga una nota de voz al servidor
    loadVoiceNote = ({ socket, file, namespaceOrRoom = 'myNamespace' }) => {
        this.uploadFile({
            socket: socket,
            file: file,
            destination: namespaceOrRoom,
            socket: socket
        });
    }

    //*Escucha los diferentes eventos del cliente
    //Todo: Esto se deberia iterar para poder escuchar los eventos segun los usuario que se vayan conectando
    listenEvents = (socket) => {
        socket.on('room message', this.#eventRoomMessage);
        socket.on('broadcast message', this.#eventBroadcastMessage);
        socket.on('direct message', this.#eventDirectMessage);
    }

    #eventRoomMessage = (data) => {
        console.log(`Mesaje recibido`, data);
        alert(data)
    }
    #eventBroadcastMessage = (data) => {
        console.log('Mensage recibido por namespace, el mensaje es: ', data);
        alert(data)
    }
    #eventDirectMessage = (data) => {
        console.log(`data`);
        alert(data)
    }


    // Desplaza automáticamente el contenedor de chat hasta el final
    autoScroll = (container) => {
        container.scrollTop = container.scrollHeight;
    }

    //incia la grabacion de audio
    startRecording = () => {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    this.mediaRecorder = new MediaRecorder(stream);
                    this.audioChunks = [];

                    this.mediaRecorder.addEventListener("dataavailable", event => {
                        this.audioChunks.push(event.data);
                    });

                    this.mediaRecorder.start();

                    // Detiene la grabación después de 2 minutos
                    this.stopRecordingTimeout = setTimeout(() => {
                        this.stopRecording();
                    }, 120000);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    // Detiene la grabación de audio
    stopRecording = () => {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject(new Error('No se está grabando audio'));
            } else {
                this.mediaRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(this.audioChunks);
                    resolve(audioBlob);

                    // Limpia las variables
                    this.mediaRecorder = null;
                    this.audioChunks = [];
                    clearTimeout(this.stopRecordingTimeout);
                });

                this.mediaRecorder.stop();
            }
        });
    }
}

export default Client