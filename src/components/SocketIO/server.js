"use strict";

import { Server } from "socket.io";
import { createServer } from "node:http";
import Message from "../../BO/messanger/control.js";
import Control from "../../BO/local/control.js";

//TODO: Aqui se manejaran los mensajes con sus rooms y nameSpaces
class SocketServer {
  constructor(app) {
    this.io;

    this.socketMap = new Map();
    this.socketJoinRoom = new Map();

    this.namespace = "myNamespace";

    this.server = this.#createServer(app);
    this.#createNsp(this.io);

    this.dbMessage = new Message();
    this.local = new Control();

    //!Prueba
    // this.#getRooms().then(data => {
    //   console.log('Estos son los locales por usuario', data)
    // })
  }

  #createServer = (app) => {
    try {
      const server = createServer(app);
      this.io = new Server(server, {
        connectionStateRecovery: {
          maxDisconnectionDuration: 200000,
        },
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
          allowedHeaders: ["my-custom-header"],
          credentials: true,
        },
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
      const route = await this.local.getAllOf({ of: 'route' });

      let arrayRoute = [];
      route.forEach((obj) => {
        arrayRoute.push(obj["de_route"]);
      });
      return arrayRoute;
    } catch (error) {
      return { error: error.message };
    }
  };

  #getRooms = async () => {
    try {
      const array = await this.#getRoutes();
      console.log(array);
      let objRooms = {};
      array.forEach((room) => {
        objRooms[room] = true;
      });

      return objRooms;
    } catch (error) {
      return { error: error.message };
    }
  };

  getServer = () => this.server;

  #onConnection = (socket) => {
    try {
      this.#saveSocket(socket, this.socketMap);

      // console.log("Un usuario se acaba de conectar el usuario --", socket.handshake.query.user);
      // console.log('Este es el mapa, ', this.socketMap);

      socket.on("file", async (data) => {
        const rooms = await this.#getRooms();
        const { destination, file, user, typeFile, message } = data;
        const date = this.#getDateNow("mm/dd/yyyy");
        try {
          const { userEmit } = socket.handshake.query;
          if (this.socketMap.get(user)) {
            if (typeFile === "image") {
              const modified = await this.dbMessage.insertTo({
                option: "image",
                params: [
                  file,
                  userEmit,
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
      });

      socket.on("general message", async (data) => {
        const { namespace, message } = data;
        const date = this.#getDateNow("mm/dd/yyyy");
        const { user } = socket.handshake.query;

        console.log(
          `Eres ${user} y envias por el nameSpace ${namespace} el mensaje de ${message}, el dia de ${date}`
        );

        if (this.namespace === namespace) {
          try {
            // const bool = await this.#iterator({
            //   userEmit: user,
            //   map: this.socketMap,
            //   typeMessage: "broadcast",
            //   message: message,
            //   option: "messageNames",
            //   date: date,
            // });
            // if (!bool || bool.error)
            //   return console.error(
            //     "Hubo un error al insertar un mensaje en la base de datos",
            //     bool.error
            //   );

            return this.io
              .to(namespace)
              .except(socket.id)
              .emit("broadcast_message", {
                contenido: message,
                usuario: user,
                fecha: date,
                emisor: user,
              });
          } catch (error) {
            return { error: error.message };
          }
        }
        return console.error("Es incorrecto el nameSpace, verifique");
        //Para emitir el mensaje a todos
      });

      socket.on("message zone", async (data) => {
        try {
          const rooms = await this.#getRooms();
          if (!rooms) return console.log("Hubo un error al crear los socket");

          const { room, message } = data;
          const { user } = socket.handshake.query;
          const date = this.#getDateNow("mm/dd/yyyy");

          // console.log(`Envias por el room ${room} el mensaje de ${message}`);
          if (!rooms[room]) {
            // console.log('PASE AQUI')
            return false;
          }

          // const bool = await this.#iterator({
          //   userEmit: user,
          //   map: this.socketJoinRoom,
          //   typeMessage: "by zone",
          //   message: message,
          //   option: "messageNames",
          //   date: date,
          // });
          // if (!bool || bool.error)
          //   return console.log(
          //     "Hubo un error al cargar un mensaje en la base de datos",
          //     bool.error
          //   );

          return this.io
            .to(room)
            .except(socket.id)
            .emit("room_message", {
              contenido: message,
              usuario: user,
              fecha: date,
            });
        } catch (error) {
          return { error: error.message };
        }
      });

      socket.on("direct message", async (data) => {
        try {
          const { user, message } = data;
          const socketReceived = this.socketMap.get(user);
          const { userEmit } = socket.handshake.query;
          const date = this.#getDateNow("mm/dd/yyyy");

          if (!socketReceived) {
            console.log("No se encontro ese usuario");
            return false;
          }

          console.log(`Envias al usuario ${user} el mensaje de ${message}`);
          const bool = await this.dbMessage.insertTo({
            option: "messagenames",
            params: [userEmit, user, "direct", message, date],
          });
          if (!bool) return false;

          return this.io.to(socketReceived).emit("direct_message", { message });
        } catch (error) {
          return { error: error.message };
        }
      });

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
      console.log("ESTOS SON LOS PARAMETROS DE ITERADOR");
      console.log(map, userEmit, typeMessage, date, option, message);

      const userLower = userEmit.toLowerCase();
      for (let [key, value] of map.entries()) {
        let keyLower = key.toLowerCase();
        //Esto se hace para que no pueda insertar en la base de datos que el mismo que la envio salga que el mismo recibio su mensaje
        if (keyLower !== userLower) {
          // console.log('Pasa a guardar un mensaje en bucle en la base de datos');
          const modified = await this.dbMessage.insertTo({
            option: option,
            params: [userLower, keyLower, typeMessage, message, date],
          });
          if (!modified) return false;
        }
      }
      return true;
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
