'use strict'

import io from 'socket.io-client';
import FileReader from 'filereader';

class Client {
    constructor(url, token) {
        this.socket = io(url, { query: { token } });
        this.profile = null;
        this.rooms = {}; // Almacena las salas
    }

    // Establece el perfil del cliente
    setProfile(profile) {
        this.profile = profile;
    }

    // Valida el perfil y los métodos a los que tiene permiso
    validateProfile() {
        if (!this.profile) {
            throw new Error('El perfil no está establecido');
        }
        // Lógica para validar el perfil y los métodos a los que tiene permiso
    }

    // Envía un mensaje a un room dentro de un namespace
    sendMessage({ room, message }) {
        if (!this.rooms[room]) {
            throw new Error(`La sala ${room} no existe`);
        }
        this.socket.emit('message', { room, message });
    }

    // Envía un mensaje directo a un usuario
    sendDirectMessage(user, message) {
        this.socket.emit('direct message', { user, message });
    }

    // Carga un archivo al servidor
    uploadFile(file, type, target) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            this.socket.emit(type, { data: evt.target.result, target });
        };
        reader.onerror = (error) => {
            console.log('Error al leer el archivo:', error);
        };
        reader.readAsDataURL(file);
    }

    // Carga una imagen al servidor
    loadImage(file, namespaceOrRoom) {
        this.uploadFile(file, 'user image', namespaceOrRoom);
    }

    // Carga una nota de voz al servidor
    loadVoiceNote(file, namespaceOrRoom) {
        this.uploadFile(file, 'voice note', namespaceOrRoom);
    }

    // Desplaza automáticamente el contenedor de chat hasta el final
    autoScroll(container) {
        container.scrollTop = container.scrollHeight;
    }

    //incia la grabacion de audio
    startRecording() {
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
    stopRecording() {
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