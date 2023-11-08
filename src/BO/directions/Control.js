'use strict'

import { Country, State, City } from 'country-state-city'

class Control {
    getCountries = ({ state = undefined, city = undefined }) => {

        return new Promise((resolve, reject) => {
            try {
                if (!state && !city) {
                    resolve(
                        Country.getAllCountries()
                            .map(country => country.name)
                    );
                }

                const searchKey = state ? state.toLowerCase() : city.toLowerCase();
                const searchField = state ? 'state' : 'city';
                const countries = Country.getAllCountries();

                //Primero filtramos la lista de paises
                const result = countries.filter(country => {

                    //Obtenemos los estados del pais actual
                    const states = State.getStatesOfCountry(country.isoCode);

                    //Y aqui verificamos si alguno coincide con la busqueda
                    return states.some(state => {
                        //Si coincide se retorna true
                        if (state.name.toLowerCase() === searchKey) return true;

                        if (searchField === 'city') {
                            //Obtenemos las ciudades del estado actual
                            const cities = City.getCitiesOfState(country.isoCode, state.isoCode);

                            //Aqui verificamos si alguna de las ciudades coincide con la busqueda
                            return cities.some(city => city.name.toLowerCase() === searchKey);
                        }
                        return false;
                    });
                }).map(country => country.name);

                resolve(result.length > 0 ? result : false);

            } catch (error) {
                reject(error)
            }

        })
    }

    getStates = ({ country, state } = {}) => {
        return new Promise((resolve, reject) => {
            try {
                if (!country && !state) {
                    resolve(
                        State.getAllStates()
                            .map(state => state.name)
                    );
                }

                const searchKey = country ? country.toLowerCase() : state.toLowerCase();
                const searchField = country ? 'country' : 'state';
                const states = State.getAllStates();
                const result = states.filter(state => {
                    if (state.name.toLowerCase() === searchKey) return true;
                    if (searchField === 'country') {
                        const country = Country.getCountryByCode(state.countryCode);
                        return country.name.toLowerCase() === searchKey;
                    }
                    return false;
                }).map(state => state.name);

                resolve(result.length > 0 ? result : false)
            } catch (error) {
                reject(error)
            }

        })

    }

    getCities({ country, state } = {}) {

        return new Promise((resolve, reject) => {
            try {

                if (!country && !state) {
                    resolve([]);
                }
                const searchKey = country ? country.toLowerCase() : state.toLowerCase();
                const searchField = country ? 'country' : 'state';
                const cities = City.getAllCities();

                const result = cities.filter(city => {
                    const states = State.getStatesOfCountry(city.countryCode);
                    const state = states.find(state => state.isoCode === city.stateCode);
                    if (state.name.toLowerCase() === searchKey) return true;

                    if (searchField === 'country') {
                        const country = Country.getCountryByCode(state.countryCode);
                        return country.name.toLowerCase() === searchKey;
                    }
                    return false;
                }).map(city => city.name);

                resolve(result.length > 0 ? result : false)
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default Control