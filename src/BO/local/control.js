"use strict";

import iManagerPgHandler from "../../data/instances/iManagerPgHandler.js";

class Control {
  constructor() { } //Todo: Se puede quitar tambien

  //?by Route || Person
  //?Params: idPerson || idRoute
  getLocalBy = async ({ by, params }) => {
    try {
      const byLower = by.toLowerCase();
      const obj = {
        person: "selectLocalByPerson",
        route: "selectLocalByRoute",
        user: 'selectOneLocalByUser'
      };

      if (!obj[byLower]) return false;

      const result = await iManagerPgHandler.executeQuery({
        key: obj[byLower],
        params: params,
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  //?Params: idLocal
  getRouteBy = async ({ option, params }) => {
    try {
      const optionLower = Array.isArray(option) ? option[0].toLowerCase() : option.toLowerCase();
      const obj = {
        local: "selectRouteByLocal",
        user: "selectOneRouteByUser",
      };

      if (!obj[optionLower]) return false;

      const result = await iManagerPgHandler.executeQuery({
        key: obj[optionLower],
        params: params,
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  //?of: local (allLocals)|| route(allRoutes) || localroute (allTwo)
  getAllOf = async (of) => {
    try {
      const ofLower = Array.isArray(of) ? of[0].toLowerCase() : of.toLowerCase();
      const obj = {
        local: "selectAllLocal",
        route: "selectAllRoute",
        localroute: "selectAllRouteAndLocal",
        localuser: "selectAllLocalByUser"
      };

      if (!obj[ofLower]) return false;

      const result = await iManagerPgHandler.executeQuery({
        key: obj[ofLower]
      });

      return result;
    } catch (error) {
      console.error(`Ocurrio un error en el metodo getAllOf del objeto control.js en el modulo local, error: ${error.message}` )
      return { error: error.message };
    }
  };

  //?to: local || route
  //?params: insertar en local || routen (nombre o descripcion)
  insertTo = async ({ to, params }) => {
    try {
      const toLower = Array.isArray(to) ? to[0].toLowerCase() : to.toLowerCase();
      const obj = {
        local: "insertLocal",
        route: "insertRoute",
      };

      if (!obj[toLower]) return false;

      const modified = await iManagerPgHandler.execute({
        key: obj[toLower],
        params: params,
      });

      return modified;
    } catch (error) {
      return { error };
    }
  };

  //?params: idPerson, idLocal (Esto se deberia obtener de los select)
  asignPersonLocal = async ({ params }) => {
    try {
      const modified = await iManagerPgHandler.execute({
        key: "insertPersonLocal",
        params: params,
      });

      return modified;
    } catch (error) {
      return { error };
    }
  };

  //?to: local || route (para editar ruta o local)
  //?params: (solo se puede editar el nombre de la ruta y local)
  editTo = async ({ to, params }) => {
    try {
      const toLower = Array.isArray(to) ? to[0].toLowerCase() : to.toLowerCase();
      const obj = {
        local: "updateLocal",
        route: "updateRoute",
      };

      if (!obj[toLower]) return false;

      const modified = await iManagerPgHandler.execute({
        key: obj[toLower],
        params: params,
      });

      return modified;
    } catch (error) {
      return { error };
    }
  };

  //?params: idRoute
  deleteRoute = async ({ params }) => {
    try {
      const deleteRoute = {
        key: "deleteRoute",
        params: params,
      };

      const deleteLocal = {
        key: deleteLocalByRoute,
      };

      const querys = [deleteRoute, deleteLocal];
      const modified = await iManagerPgHandler.transaction({
        querys: querys,
      });

      return modified;
    } catch (error) {
      return { error };
    }
  };

  //?params idLocal
  deleteLocal = async ({ params }) => {
    try {
      const deleteLocal = {
        key: "deleteLocal",
        params: params,
      };

      const deletePersonLocal = {
        key: "deletePersonLocalByLocal",
      };

      const querys = [deleteLocal, deletePersonLocal];
      const modified = await iManagerPgHandler.transaction({
        querys: querys,
      });

      return modified;
    } catch (error) {
      return { error };
    }
  };
}

export default Control;
