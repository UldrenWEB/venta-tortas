'use strict'

// import { io } from 'socket.io-client'
//*Cuando se instacie se tienen que pasar los rooms y los namespace disponibles
class Client {
    constructor({ io, url, rooms }) {
        this.rooms = rooms
        this.url = url;
        this.io = io;
        this.namespace = 'myNamespace';
    }
    //Crea el socket del cliente que se conecto
    createSocketClient = (user) => {
        try {
            const socket = this.io(this.url, {
                query: user
            })

            return socket;
        } catch (error) {
            return { error: error.message }
        }

    }
    joinNamespace = (socket) => {
        try {
            socket.emit('join_namespace', this.namespace);
            return true;
        } catch (error) {
            return { error: error.message }
        }
    }

    joinRoom = (socket, room) => {
        if (!this.rooms[room]) {
            return false;
        }
        try {
            socket.emit('join_room', room)
            return true;
        } catch (error) {
            return { error: error.message }
        }
    }

    // Envía un mensaje a un room dentro de un namespace
    sendMessage = ({ socket, room, message }) => {
        if (!this.rooms[room]) {
            return false;
        }
        try {
            socket.emit('message zone', { room, message });
            return true;
        } catch (error) {
            return { error: error.message }
        }
    }

    sendMessageBroadcast = ({ socket, message }) => {
        try {
            socket.emit('general message', { namespace: this.namespace, message })
            return true;
        } catch (error) {
            return { error: error.message }
        }
    }

    // Envía un mensaje directo a un usuario
    sendDirectMessage = ({ socketEmit, user, message }) => {
        try {
            socketEmit.emit('direct message', { user, message });
            return true;
        } catch (error) {
            return { error: error.message }
        }
    }

    // Carga un archivo al servidor
    #uploadFile = ({ user, file, destination }) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            socket.emit('file', { file: evt.target.result, destination, user });
            return true;
        };
        reader.onerror = (error) => {
            return { error: error.message }
        };
        reader.readAsDataURL(file);
    }

    // Carga una imagen al servidor
    loadImage = ({ socket, file, destination = this.namespace }) => {
        this.#uploadFile({
            socket: socket,
            file: file,
            destination: destination,
            socket: socket
        });
    }

    // Carga una nota de voz al servidor
    loadVoiceNote = ({ socket, file, destination = this.namespace }) => {
        this.#uploadFile({
            socket: socket,
            file: file,
            destination: destination,
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

    //Este metodo devuelve el tag de la imagen para que sea mostrada en el chat
    #validateImage = (data) => {
        if (data instanceof File || data instanceof Blob) {
            console.log('Es un archivo');
            const imgTag = `<img src="${data}">`
            return imgTag;
        } else return false
    }

    #eventRoomMessage = (data) => {
        const isImg = this.#validateImage();
        if (isImg) return isImg;

        console.log(`Mesaje recibido`, data);
        alert(data)
    }
    #eventBroadcastMessage = (data) => {
        const isImg = this.#validateImage();
        if (isImg) return isImg;

        console.log('Mensage recibido por namespace, el mensaje es: ', data);
        alert(data)
    }
    #eventDirectMessage = (data) => {
        const isImg = this.#validateImage();
        if (isImg) return isImg;

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