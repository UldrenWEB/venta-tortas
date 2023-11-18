/**
 * @file Archivo principal de la aplicación.
 * @description Este archivo inicia el servidor y configura los middlewares y routers, ejecutando el SessionComponent y el Security Component.
 * @author Enmanuel Colina <theenmanuel123@gmail.com>
 */

import express from "express";
import picocolors from "picocolors";
import iSession from "./src/data/instances/iSession.js";
import { loginRouter, toProcessRouter, logoutRouter, setProfileRouter, changePasswordRouter, olvidoDatosRouter, homeRouter, desbloquearRouter } from "./src/routers/dispatcher.js";
import { midCors, midNotFound, midAuthLogin, midNotProfile, midJson } from "./src/middlewares/middlewares.js";
import SocketServer from "./src/components/SocketIO/server.js";
/**
 * Puerto en el que se iniciará el servidor.
 * @type {number}
 */
const PORT = process.env.PORT ?? 7878;

/**
 * Instancia de la aplicación Express.
 * @type {express.Application}
 */
const app = express();
// Configuración de middlewares y routers.
app.use(midCors);
// app.use(cors({credentials: true, origin: true})); // <-- Se agrego para Navegador WEB
app.use(iSession.loadSession);
app.use(express.json());
app.use(midJson) // <-- Se agrego para manejar excepciones de JSON en formato incorrecto
app.use("/login", midAuthLogin, loginRouter);
app.use("/olvidoDatos", olvidoDatosRouter)
app.use("/desbloquear", desbloquearRouter)
app.use(iSession.midSessionExist);
app.use("/home", homeRouter)
app.use("/setProfile", setProfileRouter)
app.use("/logout", logoutRouter);
app.use("/changePassword", changePasswordRouter);
app.use(midNotProfile)
app.use("/toProcess", toProcessRouter);
app.use(midNotFound);

/**
 * Función que se ejecuta cuando el servidor está escuchando en el puerto especificado.
 * @function
 * @returns {void}
 */
const listenServer = () =>
  console.log(
    picocolors.bgWhite(
      picocolors.black(`El servidor esta iniciado en el PUERTO ${PORT}...`)
    )
  );

// Inicio del servidor
app.listen(PORT, listenServer);
