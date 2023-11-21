"use strict";

import { Server } from "socket.io";
import { createServer } from "node:http";
import Message from "../../BO/messanger/control.js";
import Control from "../../BO/local/control.js";

//TODO: Aqui se manejaran los mensajes con sus rooms y nameSpaces
class SocketServer {
  constructor(app) {
    this.io;
    this.rooms = {};
    this.socketMap = new Map();
    this.socketJoinRoom = new Map();
    this.namespace = "myNamespace";
    this.server = this.#createServer(app);
    this.#createNsp(this.io);
    this.dbMessage = new Message();
    this.local = new Control();
  }

  #createServer = (app) => {
    try {
      const server = createServer(app);
      this.io = new Server(server, {
        connectionStateRecovery: {
          maxDisconnectionDuration: 200000
        },
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
          allowedHeaders: ["my-custom-header"],
          credentials: true
        }
      });

      return server;
    } catch (error) {
      return { error: error.message };
    }
  };

  #createNsp = (io) => {
    return io.of(this.namespace);
  };

  manager = () => {
    this.io.on("connection", this.#onConnection); //Se conecto
  };

  //Los rooms son un arreglo de nombres de los diferentes rooms
  #getRoutes = async () => {
    try {
      const routes = await this.local.getAllOf({
        of: "route",
      });
      let arrayRoutes = [];
      routes.forEach((obj) => {
        arrayRoutes.push(obj["de_route"]);
      });
      return arrayRoutes;
    } catch (error) {
      return { error: error.message };
    }
  };

  #createRoom = async () => {
    try {
      const array = await this.#getRoutes();

      let objRooms = {};
      array.forEach((room) => {
        objRooms[room] = true;
      });

      console.log("Aqui objeto", objRooms);
      return objRooms;
    } catch (error) {
      return { error: error.message };
    }
  };

  getServer = () => this.server;

  #onConnection = (socket) => {
    try {
      this.#saveSocket(socket, this.socketMap);

      //if (!socket.recovered) { }//*Algo asi era
      //TODO: ME FALTA CARGAR LOS DATOS DESPUES DE UNA DESCONEXION PARA QUE CARGUE TODO EL CHAT CUANDO SE VUELVA A CONECTAR YA TENGA TODOS SUS

      console.log(
        "Un usuario se acaba de conectar",
        this.socketMap.has(socket.handshake.query.user)
      );

      socket.on("file", this.#manageFile);
      socket.on("general message", this.#eventBroadcast);
      socket.on("message zone", this.#eventMessage);
      socket.on("direct message", this.#eventDirectMessage);

      //*Estos eventos si se utililizan aqui para poder capturar el socket unirse a la sala y escuchar el evento
      socket.on("disconnect", () => {
        const { user } = socket.handshake.query;
        console.log("El usuario de desconecto");
        this.socketJoinRoom.delete(user);
        this.socketMap.delete(user);
      });

      socket.on("join_namespace", (namespace) => {
        socket.join(namespace);
        console.log(`El socket ${socket.id} se conecto al nameSpace`);
      });

      socket.on("join_room", (room) => {
        socket.join(room);
        this.#saveSocket(socket, this.socketJoinRoom);
        console.log(`El socket ${socket.id} se unio al room ${room}`);
      });

      //*Fin de dichos eventos
    } catch (error) {
      return { error: error.message };
    }
  };
  #iterator = async ({ map, userEmit, typeMessage, date, option, message }) => {
    try {
      for (let key of map) {
        if (key != user) {
          const modified = await this.dbMessage.insertTo({
            option: option,
            params: [userEmit, key, typeMessage, message, date],
          });
          if (!modified) return false;
        }
      }
    } catch (error) {
      return { error: error.message };
    }
  };

  //Enviar al namespace o algun room en especifico
  #manageFile = async (data) => {
    const rooms = await this.#createRoom();
    const { socket, destination, file, user, typeFile, message } = data;
    const date = this.#getDateNow("mm/dd/yyyy");
    try {
      const { user } = socket.handshake.query;
      if (this.socketMap.get(user)) {
        if (typeFile === "image") {
          const modified = await this.dbMessage.insertTo({
            option: "image",
            params: [
              file,
              user,
              this.socketMap.get(user),
              "direct",
              message,
              date,
            ],
          });
          if (!modified) return false;

          this.io
            .to(this.socketMap[socket])
            .emit("direct_message", { file, typeFile, message });
          return true;
        }
        return false;
      } else if (destination === this.namespace) {
        if (typeFile === "image") {
          let bool = await this.#iterator({
            userEmit: user,
            map: this.socketMap,
            typeMessage: "broadcast",
            message: message,
            option: "image",
            date: date,
          });
          if (!bool) return false;

          this.io
            .to(destination)
            .emit("broadcast_message", { file, typeFile, message });
          return true;
        }

        return false;
      } else if (rooms[destination]) {
        if (typeFile === "image") {
          let bool = await this.#iterator({
            userEmit: user,
            map: this.socketJoinRoom,
            typeMessage: "zone",
            message: message,
            option: "image",
            date: date,
          });
          if (!bool) return false;

          this.io
            .to(destination)
            .emit("room_message", { file, typeFile, message });
          return true;
        }
      }

      return false;
    } catch (error) {
      return { error: error.message };
    }
  };

  #eventBroadcast = async (data) => {
    const { socket, namespace, message } = data;
    const date = this.#getDateNow("mm/dd/yyyy");
    const { user } = socket.handshake.query;

    console.log(
      `Envias por el nameSpace ${namespace} el mensaje de ${message}, el dia de ${date}`
    );

    if (this.namespace === namespace) {
      try {
        const bool = await this.#iterator({
          userEmit: user,
          map: this.socketMap,
          typeMessage: "broadcast",
          message: message,
          option: "messageNames",
          date: date,
        });
        if (!bool) return false;

        return this.io.to(namespace).emit("broadcast_message", { message });
      } catch (error) {
        return { error: error.message };
      }
    }
    return console.error("Es incorrecto el nameSpace, verifique");
    //Para emitir el mensaje a todos
  };

  #eventMessage = async (data) => {
    const rooms = await this.#createRoom();
    const { socket, room, message } = data;
    const { user } = socket.handshake.query;
    const date = this.#getDateNow("mm/dd/yyyy");
    console.log(`Envias por el room ${room} el mensaje de ${message}`);
    try {
      if (!rooms[room]) return false;

      const bool = await this.#iterator({
        userEmit: user,
        map: this.socketJoinRoom,
        typeMessage: "zone",
        message: message,
        option: "messageNames",
        date: date,
      });
      if (!bool) return false;

      return this.io.to(room).emit("room_message", { message });
    } catch (error) {
      return { error: error.message };
    }
  };

  #eventDirectMessage = async (data) => {
    const { user, message } = data;
    const socketReceived = this.socketMap.get(user);
    const { userEmit } = socket.handshake.query;
    const date = this.#getDateNow("mm/dd/yyyy");

    if (!socketReceived) {
      console.log("No se encontro ese usuario");
      return false;
    }
    console.log(`Envias al usuario ${user} el mensaje de ${message}`);
    try {
      const bool = await this.dbMessage.insertTo({
        option: "messagenames",
        params: [userEmit, user, "direct", message, date],
      });
      if (!bool) return false;

      return this.io.to(socketReceived).emit("direct_message", { message });
    } catch (error) {
      return { error: error.message };
    }
  };

  #saveSocket = (socket, map) => {
    const { user, profile } = socket.handshake.query;
    const obj = {
      id: socket.id,
      profile: profile,
    };
    map.set(user, obj);
  };

  #getDateNow = (format) => {
    let date = new Date();

    //*Crear las partes de la date
    let day = String(date.getDate()).padStart(2, "0");
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let year = date.getFullYear();

    //Se reemplaza para cambiar el formatadoo y los separres
    format = format.toLowerCase();
    format = format.replace("dd", day);
    format = format.replace("mm", month);
    format = format.replace("yyyy", year);

    return format;
  };
}

export default SocketServer;
