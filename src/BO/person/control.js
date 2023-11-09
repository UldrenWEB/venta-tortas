import iManagerPgHandler from "../../data/instances/iManagerPgHandler.js";

//TODO: REVISAR QUE PUEDE DEVOLVER PARA ESPECIFICAR EN LAS PROMESAS

class control {
  /**
   * Permite crear una persona o una address.
   * @param {Object} options - Opciones de la persona o la address.
   * @param {String} options.option - Puede ser person o address.
   * @param {Array} [options.params = []] - Parametros para la query.
   * @returns {Promise}
   */
  createTo = async ({ option, params = [] }) => {
    try {
      const byLower = option.toLowerCase();
      const objQuerys = {
        person: "insertPerson",
        address: "insertAddress",
      };

      if (!objQuerys[byLower]) return false;

      const result = await iManagerPgHandler.executeQuery({
        key: objQuerys[byLower],
        params: params,
      });

      return result;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Permite editar una persona o una address.
   * @param {Object} options - Opciones de la persona o la address.
   * @param {String} options.option - Puede ser person o address.
   * @param {Array} [options.params = []] - Parametros para la query.
   * @returns {Promise} - Resultado de la consulta o un objeto Error si ocurre un error.
   */
  editTo = async ({ option, params = [] }) => {
    try {
      const byLower = option.toLowerCase();
      const objQuerys = {
        person: "updatePerson",
        address: "updateAddress",
      };

      if (!objQuerys[byLower]) return false;

      const result = await iManagerPgHandler.executeQuery({
        key: objQuerys[byLower],
        params: params,
      });

      return result;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Obtiene todos los elementos de un tipo específico de la base de datos.
   * @param {Object} options - Las opciones para la consulta.
   * @param {string} options.option - El tipo de elementos a obtener. Puede ser "person", "address", "typePerson" o "getAllPersonWithAddress".
   * @returns {Promise} - Una promesa que resuelve con el resultado de la consulta o un error.
   */
  getAllOf = async ({ option }) => {
    try {
      const byLower = option.toLowerCase();
      const objQuerys = {
        person: "getAllPerson",
        address: "getAllAddress",
        typePerson: "getAllTypePerson",
        getAllPersonWithAddress: "getAllPersonWithAddress",
      };

      if (!objQuerys[byLower]) return false;

      const result = await iManagerPgHandler.executeQuery({
        key: objQuerys[byLower],
      });

      return result;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Permite agregar una persona a un(os) tipo(s) de persona.
   * @param {Object} options - Opciones de la persona o la address.
   * @param {number} options.idPerson - Id de la persona.
   * @param {Array<Numbers>} [options.idTypePerson = []] - Id de los tipos de persona.
   * @returns {Promise} - Resultado de la consulta o un objeto Error si ocurre un error.
   */
  addTypePerson = async ({ idPerson, idTypePerson = [] }) => {
    const arrayTypes = [...idTypePerson];

    try {
      const types = arrayTypes.map((type) => {
        const obj = { key: "insertTypePerson", params: [idPerson, type] };
        return obj;
      });

      const result = await iManagerPgHandler.transaction({ querys: types });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  /**
   * Elimina una persona y su tipo de persona asociado de la base de datos.
   * @param {Object} options - Las opciones para la eliminación.
   * @param {number} options.idPerson - El ID de la persona a eliminar.
   * @returns {Promise} - Una promesa que resuelve con el resultado de la transacción o un error.
   */
  deletePerson = async ({ idPerson }) => {
    try {
      const deleteTypePerson = {
        key: "deletePersonTypePerson",
        params: [idPerson],
      };

      const deletePerson = { key: "deletePerson", params: [idPerson] };

      const querys = [deleteTypePerson, deletePerson];

      const result = iManagerPgHandler.transaction({ querys });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  /**
   * Crea una nueva persona en la base de datos.
   * @param {Object} options - Las opciones para la creación.
   * @param {Object|number} options.address - La dirección de la persona. Si es un objeto, se creará una nueva dirección. Si es una number, se usará como ID de la dirección existente.
   * @param {Array} [options.idTypePerson = []] - Los IDs de los tipos de persona a asociar con la nueva persona.
   * @param {Array} [options.paramsPerson=[]] - Los parámetros para la creación de la persona.
   * @returns {Promise} - Una promesa que resuelve con el resultado de la transacción o un error.
   */
  createPerson = async ({ address, idTypePerson = [], paramsPerson = [] }) => {
    try {
      const idAddress =
        typeof address === "object"
          ? await this.createTo({ option: "address", params: address })
          : address;

      const queryPerson = {
        key: "insertPerson",
        params: [...paramsPerson, idAddress],
        insertResult: true,
      };

      //TODO: Revisar esto
      const querysType = idTypePerson.map((type) => {
        const obj = {
          key: "insertTypePerson",
          params: [type],
          insertResult: true,
        };
        return obj;
      });

      const querys = [...querysType, queryPerson];

      const result = await iManagerPgHandler.transaction({ querys });
      return result;
    } catch (error) {
      return { error: error.message };
    }
  };
}

export default control;
