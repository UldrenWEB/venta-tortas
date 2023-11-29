"use strict";

import iManagerPgHandler from "../../data/instances/iManagerPgHandler.js";

class Control {
  constructor() { } //Todo: Se quita si no se usa pd: Ya quite el otro

  addDirection = async ({
    nameCountry,
    nameState,
    nameCity,
    nameMuni,
    nameStreet,
  }) => {
    try {
      const existCountry = iManagerPgHandler.returnByProp({
        key: "selectCountry",
        params: [nameCountry],
        prop: "na_country",
      });

      if (!existCountry) return;

      const country = existCountry
        ? { id: existCountry }
        : {
          key: "insertCountry",
          params: [nameCountry],
          insertResult: true
        };

      const state = {
        key: "insertState",
        params: [existCountry, nameState],
        insertResult: true
      };

      const city = {
        key: "insertCity",
        params: [nameCity],
        insertResult: true
      };

      const muni = {
        key: "insertMuni",
        params: [nameMuni],
        insertResult: true
      };

      const street = {
        key: "insertStreet",
        params: [nameStreet],
        insertResult: true
      };

      const querys = [country, state, city, muni, street];

      const result = await iManagerPgHandler.transaction({
        querys: querys,
      });
      if (result.command === "COMMIT") return true;
    } catch (error) {
      return { error: error.message };
    }
  };

  addDirectionEspecified = async ({ direction, params }) => {
    try {
      const directionLowerCase = direction.toLowerCase();
      const obj = {
        country: "insertCountry",
        state: "insertState",
        city: "insertCity",
        municipality: "insertMuni",
        street: "insertStreet",
      };

      if (!obj[directionLowerCase]) return false;

      const result = await iManagerPgHandler.execute({
        key: obj[directionLowerCase],
        params: params,
      });
      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  //Se asume que ya que es un select el nombre sera igual a como esta en la base de datos
  editMuniOrStreet = async ({ direction, oldName, newName }) => {
    try {
      const directionLC = direction.toLowerCase();

      const obj = {
        municipality: "updateMuni",
        street: "updateStreet",
      };

      const verify = obj[directionLC] ? obj[directionLC] : false;
      if (!verify) return verify;

      const select =
        verify === "municipality"
          ? ["selectMuni", "id_municipality"]
          : ["selectStreet", "id_street"];

      const [key, prop] = select;

      const id = iManagerPgHandler.returnByProp({
        key: key,
        params: [oldName],
        prop: prop,
      });

      if (!id) return false;

      const modified = iManagerPgHandler.execute({
        key: verify,
        params: [newName, id],
      });

      return modified;
    } catch (error) {
      return { error: error.message };
    }
  };

  getDirectionBy = async ({ by, params }) => {
    try {
      const byLower = by.toLowerCase();
      const obj = {
        route: "selectDirectionByRoute",
        local: "selectDirectionByLocal",
      };

      if (!obj[byLower]) return false;

      const result = iManagerPgHandler.executeQuery({
        key: obj[byLower],
        params: params,
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  //*Aqui se pasa el id Person ya que se obtendra de un select y una persona puede tener el mismo nombre que otro
  getAddressByPerson = async ({ params }) => {
    try {
      const result = iManagerPgHandler.executeQuery({
        key: "selectAddressByPerson",
        params: [params],
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  getAll = async ({ direction }) => {
    try {
      const directionLower = direction.toLowerCase();
      const obj = {
        direction: "selectAllDirection",
        address: "selectAllAdress",
        country: "selectAllCountries",
        state: "selectAllStates",
        city: "selectAllCities",
        municipality: "selectAllMuni",
        street: "selectAllStreet",
      };


      if (!obj[directionLower]) return false;

      const result = iManagerPgHandler.executeQuery({
        key: obj[directionLower],
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };
}

export default Control;
