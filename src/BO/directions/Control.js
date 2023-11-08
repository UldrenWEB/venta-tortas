"use strict";

import { Country, State, City } from "country-state-city";
import iManagerPgHandler from "../../data/instances/iManagerPgHandler";

class Control {
  constructor() {} //TODO: Si no se pone nada aqui, quitar este constructor

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
          };

      const state = {
        key: "insertState",
        params: [existCountry, nameState],
      };

      const city = {
        key: "insertCity",
        params: [nameCity],
      };

      const muni = {
        key: "insertMuni",
        params: [nameMuni],
      };

      const street = {
        key: "insertStreet",
        params: [nameStreet],
      };

      const querys = [country, state, city, muni, street];

      const result = await iManagerPgHandler.transaction({
        querys: querys,
      });
      if (result.command === "COMMIT") return true;
    } catch (error) {
      return { error };
    }
  };

  addDirectionEspecified = async ({ direction, params }) => {
    const directionLowerCase = direction.toLowerCase();

    const obj = {
      country: "insertCountry",
      state: "insertState",
      city: "insertCity",
      municipality: "insertMuni",
      street: "insertStreet",
    };

    const verify = obj[directionLowerCase] ? obj[directionLowerCase] : false;

    if (!verify) return verify;

    try {
      const result = await iManagerPgHandler.execute({
        key: verify,
        params: params,
      });
      return result;
    } catch (error) {
      return { error };
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
        params: [newName, result],
      });

      return modified;
    } catch (error) {
      return { error };
    }
  };

  getCountries = ({ state = undefined, city = undefined }) => {
    return new Promise((resolve, reject) => {
      try {
        if (!state && !city) {
          resolve(Country.getAllCountries().map((country) => country.name));
        }

        const searchKey = state ? state.toLowerCase() : city.toLowerCase();
        const searchField = state ? "state" : "city";
        const countries = Country.getAllCountries();

        //Primero filtramos la lista de paises
        const result = countries
          .filter((country) => {
            //Obtenemos los estados del pais actual
            const states = State.getStatesOfCountry(country.isoCode);

            //Y aqui verificamos si alguno coincide con la busqueda
            return states.some((state) => {
              //Si coincide se retorna true
              if (state.name.toLowerCase() === searchKey) return true;

              if (searchField === "city") {
                //Obtenemos las ciudades del estado actual
                const cities = City.getCitiesOfState(
                  country.isoCode,
                  state.isoCode
                );

                //Aqui verificamos si alguna de las ciudades coincide con la busqueda
                return cities.some(
                  (city) => city.name.toLowerCase() === searchKey
                );
              }
              return false;
            });
          })
          .map((country) => country.name);

        resolve(result.length > 0 ? result : false);
      } catch (error) {
        reject(error);
      }
    });
  };

  getStates = ({ country = undefined, state = undefined }) => {
    return new Promise((resolve, reject) => {
      try {
        if (!country && !state) {
          resolve(State.getAllStates().map((state) => state.name));
        }

        const searchKey = country ? country.toLowerCase() : state.toLowerCase();
        const searchField = country ? "country" : "state";
        const states = State.getAllStates();
        const result = states
          .filter((state) => {
            if (state.name.toLowerCase() === searchKey) return true;
            if (searchField === "country") {
              const country = Country.getCountryByCode(state.countryCode);
              return country.name.toLowerCase() === searchKey;
            }
            return false;
          })
          .map((state) => state.name);

        resolve(result.length > 0 ? result : false);
      } catch (error) {
        reject(error);
      }
    });
  };

  getCities({ country = undefined, state = undefined }) {
    return new Promise((resolve, reject) => {
      try {
        if (!country && !state) {
          resolve([]);
        }
        const searchKey = country ? country.toLowerCase() : state.toLowerCase();
        const searchField = country ? "country" : "state";
        const cities = City.getAllCities();

        const result = cities
          .filter((city) => {
            const states = State.getStatesOfCountry(city.countryCode);
            const state = states.find(
              (state) => state.isoCode === city.stateCode
            );
            if (state.name.toLowerCase() === searchKey) return true;

            if (searchField === "country") {
              const country = Country.getCountryByCode(state.countryCode);
              return country.name.toLowerCase() === searchKey;
            }
            return false;
          })
          .map((city) => city.name);

        resolve(result.length > 0 ? result : false);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default Control;
