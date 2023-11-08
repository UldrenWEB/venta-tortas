import Pool from "pg-pool";

/**
 * Clase que maneja la conexión y ejecución de consultas a una base de datos PostgreSQLv usando Pg-Pool.
 */
class PgHandler {
  /**
   * Crea una instancia de PgHandler.
   * @param {Object} options - Opciones para la configuración y consultas de la base de datos.
   * @param {Object} options.config - Configuración de la conexión a la base de datos.
   * @param {Object} options.querys - Consultas predefinidas para la base de datos.
   */
  constructor({ config }) {
    /**
     * Configuración de la conexión a la base de datos.
     * @type {Object}
     */
    this.config = config;
    /**
     * Consultas predefinidas para la base de datos.
     * @type {Object}
     */
    this.querys = querys;
    /**
     * Pool de conexiones a la base de datos.
     * @type {Pool}
     */
    this.pool = new Pool(this.config);
  }

  /**
   * Ejecuta una consulta a la base de datos.
   * @async
   * @param {Object} options - Opciones para la ejecución de la consulta.
   * @param {string} options.query - Consulta a ejecutar.
   * @param {Array} [options.params=[]] - Parámetros para la consulta.
   * @returns {Promise<Array|Error>} - Resultado de la consulta o un objeto Error si ocurre un error.
   */
  executeQuery = async ({ query, params = undefined }) => {
    try {
      const client = await this.#connect();

      const { rows } = await client.query(query, params);
      await this.#release(client);

      return rows;
    } catch (error) {
      return { error };
    }
  };

  execute = async ({ query, params = undefined }) => {
    const client = await this.#connect();
    await client.query('BEGIN')

    try {
      const { rowCount } = await client.query(query, params);
      await client.query('COMMIT')

      return rowCount;
    } catch (error) {
      return { error }
    } finally {
      await this.#release(client)
    }
  }


  /**
   * Conecta a la base de datos.
   * @async
   * @returns {Promise<import('pg').Client>} - Cliente de la conexión a la base de datos.
   */
  #connect = async () => {
    try {
      return await this.pool.connect();
    } catch (error) {
      return { error };
    }
  };

  /**
   * Libera la conexión a la base de datos.
   * @async
   * @returns {Promise<void>}
   */
  #release = async (client) => {
    try {
      await client.release();
    } catch (error) {
      return { error };
    }
  };

  /**
   * Ejecuta una transacción de base de datos utilizando una serie de consultas.
   * @async
   * @param {Object} options - Objeto con las opciones para la transacción.
   * @param {Array<String>} options.query - Un array de objetos que contienen la clave de la consulta y los parámetros de la consulta.
   * @returns {Promise<Object>} - Una promesa que se resuelve con el resultado de la transacción o se rechaza con un error.
   */
  transaction = async ({ querys = [] }) => {
    const client = await this.#connect();
    try {
      await client.query("BEGIN");
      for (const elemento of querys) {
        const { key, params } = elemento;
        await client.query(this.querys[key], params);
      }
      const result = await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      return { error };
    } finally {
      await client.release();
    }
  };
}

export default PgHandler;
