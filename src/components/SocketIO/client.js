'use strict'

// import { io } from 'socket.io-client'
//*Cuando se instacie se tienen que pasar los rooms y los namespace disponibles
class Client {
  constructor({ io, url, rooms }) {
    this.rooms = rooms
    this.url = url;
    this.io = io;
    this.namespace = 'myNamespace';
    this.imgTag;
    this.receivedEvent = {
      room_message: this.#eventRoomMessage,
      broadcast_message: this.#eventBroadcastMessage,
      direct_message: this.#eventDirectMessage
    }
  }
  //Crea el socket del cliente que se conecto
  createSocketClient = (user) => {
    try {
      const socket = this.io(this.url, {
        query: {
          ...user,
          timeStamp: 0
        }
      })

      return socket;
      
    } catch (error) {
      console.error(`Ocurrio un error en el metodo createSocketClient: ${error.message} del archivo SocketIO/client.js`)
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
      socket.emit('message zone', { socket, room, message });
      return true;
    } catch (error) {
      return { error: error.message }
    }
  }

  sendMessageBroadcast = ({ socket, message }) => {
    try {
      socket.emit('general message', { socket, namespace: this.namespace, message })
      return true;
    } catch (error) {
      return { error: error.message }
    }
  }

  // Envía un mensaje directo a un usuario
  sendDirectMessage = ({ socketEmit, user, message }) => {
    try {
      socketEmit.emit('direct message', { socketEmit, user, message });
      return true;
    } catch (error) {
      return { error: error.message }
    }
  }

  // Carga un archivo al servidor
  #uploadFile = ({ socket, user, file, destination, message, isImg }) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      socket.emit('file', { socket, file: evt.target.result, destination, user, message, isImg });
      return true;
    };
    reader.onerror = (error) => {
      return { error: error.message }
    };
    reader.readAsDataURL(file);
  }

  // Carga una imagen al servidor
  loadImage = ({ socket, file, destination = this.namespace, message = 'image' }) => {
    this.#uploadFile({
      socket: socket,
      file: file,
      destination: destination,
      socket: socket,
      typeFile: 'image',
      message: message
    });
  }

  // Carga una nota de voz al servidor
  loadVoiceNote = ({ socket, file, destination = this.namespace, message = 'voice' }) => {
    this.#uploadFile({
      socket: socket,
      file: file,
      destination: destination,
      socket: socket,
      typeFile: 'voice',
      message: message
    });
  }

  //*Escucha los diferentes eventos del cliente
  listenEvents = (socket) => {
    /*
    socket.on('room message', this.#eventRoomMessage);
    socket.on('broadcast message', this.#eventBroadcastMessage);
    socket.on('direct message', this.#eventDirectMessage);
    */
    //!Iterando
    const events = this.receivedEvent;
    for (let key in events) {
      socket.on(key, events[key])
    }
  }

  //Este metodo devuelve el tag de la imagen para que sea mostrada en el chat
  #validateImage = (data) => {
    const { file, typeFile } = data;
    if (typeFile === 'image') {
      console.log('Es una imagen');
      const imgTag = `<img src="${file}">`
      return imgTag;
    } else if (typeFile === 'voice') {
      console.log('Es un audio');
      //Manejo de audio
      return true;
    } else {
      return false;
    }
  }

  #eventRoomMessage = (data) => {
    const isImg = this.#validateImage(data);
    if (isImg) this.#setImgTag(isImg);

    console.log(`Mesaje recibido`, data);
    //Logica para mostrar mensajes recibidos por el usuario, se puedo pasar en el constructor los 3 diferentes container para poder llenarlos cuando se reciba un mensaje
  }
  #eventBroadcastMessage = (data) => {
    const isImg = this.#validateImage();
    if (isImg) this.#setImgTag(isImg);

    console.log('Mensage recibido por namespace, el mensaje es: ', data);
    //Logica para mostrar mensajes recibidos por el usuario, se puedo pasar en el constructor los 3 diferentes container para poder llenarlos cuando se reciba un mensaje
  }
  #eventDirectMessage = (data) => {
    const isImg = this.#validateImage();
    if (isImg) this.#setImgTag(isImg);

    console.log(`data`);
    //Logica para mostrar mensajes recibidos por el usuario, se puedo pasar en el constructor los 3 diferentes container para poder llenarlos cuando se reciba un mensaje
  }
  #setImgTag = (img) => {
    this.imgTag = img
  }

  getImgTag = () => {
    return this.imgTag;
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