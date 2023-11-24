"use strict";
import PgHandler from "./PgHandler.js";

/**
 * Clase para manejar las consultas a la base de datos.
 */
class ManagerPgHandler {
  /**
   * Crea una nueva instancia de ManagerPgHandler.
   * @param {Object} options - Las opciones para crear la instancia.
   * @param {Object} options.config - La configuración para el manejador de PostgreSQL.
   * @param {Object} options.querys - Las consultas SQL que se pueden ejecutar.
   */
  constructor({ config, querys }) {
    this.pgHandler = new PgHandler({ config });

    this.querys = querys;
  }

  /**
   * Ejecuta una consulta y devuelve una propiedad del resultado.
   * @param {Object} options - Las opciones para la consulta.
   * @param {string} options.key - La clave de la consulta a ejecutar.
   * @param {Array} [options.params] - Los parámetros para la consulta.
   * @param {string} options.prop - La propiedad del resultado a devolver.
   * @returns {Promise<String>} - Una promesa que resuelve con la propiedad del resultado o un error.
   */
  returnByProp = async ({ key, params, prop }) => {
    try {
      let [result] = await this.pgHandler.executeQuery({
        query: this.querys[key],
        params,
      });

      //Para comprobar:
      // console.log("Manager/ReturnByPropj ->", result[prop]);

      return result && result[prop] ? result[prop] : false;    } catch (error) {
      console.error(`Ocurrio un error en el metodo returnByProp: ${error.message} del objeto ManagerPgHandler.js`);
      return { error: error.message };
    }
  };

  /**
   * Ejecuta una consulta y devuelve si fue exitosa o no.
   * Segun las filas que devuelva, se sabe si la consulta tuvo exito o no.
   * @param {Object} options - Las opciones para la consulta.
   * @param {string} options.key - La clave de la consulta a ejecutar.
   * @param {Array} [options.params] - Los parámetros para la consulta.
   * @returns {Promise<Boolean>} - Una promesa que resuelve con un booleano indicando si la consulta fue exitosa o un error.
   */
  execute = async ({ key, params }) => {
    console.log(this.querys[key])
    try {
      let rowCount = await this.pgHandler.execute({
        query: this.querys[key],
        params: params,
      });

      console.log(rowCount)

      return rowCount > 0;
    } catch (error) {
      console.error(`Ocurrio un error en el metodo execute: ${error.message} del objeto ManagerPgHandler.js`)
      return { error };
    }
  };

  /**
   * Ejecuta una consulta y devuelve el resultado.
   * @param {Object} options - Las opciones para la consulta.
   * @param {string} options.key - La clave de la consulta a ejecutar.
   * @param {Array} [options.params] - Los parámetros para la consulta.
   * @returns {Promise<Array | Error>} - Una promesa que resuelve con el resultado de la consulta o un error.
   */
  executeQuery = async ({ key, params }) => {
    try {
      const result = await this.pgHandler.executeQuery({
        query: this.querys[key],
        params: params,
      });

      return result.length > 0 ? result : false;
    } catch (error) {
      console.error(`Ocurrio un error en el metodo executeQuery: ${error.message} del objeto ManagerPgHandler.js`)
      return { error };
    }
  };

  /**
   * Ejecuta una transacción con varias consultas.
   * @param {Object} options - Las opciones para la transacción.
   * @param {Array} [options.querys] - Las consultas a ejecutar en la transacción.
   * @returns {Promise<Array | Error>} - Una promesa que resuelve con el resultado de la transacción o un error.
   */
  transaction = async ({ querys = [] }) => {
    try {
      const result = await this.pgHandler.transaction({
        objQuerys: this.querys,
        querys: querys,
      });

      return result;
    } catch (error) {
      console.error(`Ocurrio un error en el metodo transaction: ${error.message} del objeto ManagerPgHandler.js`)
      return { error };
    }
  };
}

export default ManagerPgHandler;
