//TODO: RECORDAR VALIDAR CON SCHEMAS TODO LO QUE ENTRE POR PARAMETROS
import iManagerPgHandler from "../../data/instances/iManagerPgHandler.js";
class seller {
  /**
   * Obtiene la información de un vendedor.
   *
   * @async
   * @param {Object} options - Las opciones para obtener la información del vendedor.
   * @param {number} options.idSeller - El ID del vendedor.
   * @returns {Promise<Object>} La información del vendedor. Si ocurre un error, retorna un objeto con la propiedad `error`.
   */
  getInfoSeller = async ({ idSeller }) => {
    try {
      const result = await iManagerPgHandler.executeQuery({
        key: "getInfoSeller",
        params: [idSeller],
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  /**
   * Permite obtener vendedores segun diferentes parametros
   * @async
   * @param {Object} options - Las opciones para obtener vendedores.
   * @param {('default'|'route'|'assignment'|'sells'|'sellsMin'|'sellsMax'|'sellsByDate'|'sellsByRangeDate'|'sellsByAmmount'|'sellsByAmmountMin'|'sellsByAmmountMax')} [options.option='default'] - El tipo de ordenamiento.
   * - 'default': Por defecto, ordenados por nombre
   * - 'route': Por ruta
   * - 'assignment': Por asignacion
   * - 'sells': Por cantidad de ventas
   * - 'sellsMin': Por cantidad de ventas de aqui para abajo
   * - 'sellsMax': Por cantidad de ventas de aqui para arriba
   * - 'sellsByDate': Por cantidad de ventas en una fecha
   * - 'sellsByRangeDate': Por cantidad de ventas en un rango de fechas
   * - 'sellsByAmmount': Por monto de ventas de aqui para abajo
   * - 'sellsByAmmountMin': Por monto de ventas de aqui para abajo
   * - 'sellsByAmmountMax': Por monto de ventas de aqui para arriba
   * @param {Array} options.params
   * @returns {Promise<Array>}
   */
  getSellersBy = async ({ option = "default", params }) => {
    try {
      const objLower = option.toLowerCase();

      const objQuerys = {
        default: "getSellersAZ",
        route: "getSellersRoute",
        assignment: "getSellersAssignment",
        sells: "getSellersSells",
        sellsMin: "getSellerSellsMin", //Para cantidad de ventas
        sellsMax: "getSellerSellsMax",
        sellsByDate: "getSellerSellsByDate",
        sellsByRangeDate: "getSellerSellsByRangeDate",
        sellsByAmmount: "getSellerSellsByAmmount", //Por monto de aqui a abajo
        sellsByAmmountMin: "getSellerSellsByAmmountMin",
        sellsByAmmountMax: "getSellerSellsByAmmountMax",
      };

      if (!objQuerys[objLower]) return false;

      const result = await iManagerPgHandler.executeQuery({
        key: objQuerys[objLower],
        params,
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  /**
   * Desactiva un vendedor.
   * @async
   * @param {Object} options - Las opciones para desactivar el vendedor.
   * @param {number} options.idSeller - El ID del vendedor.
   * @returns {Promise<Object>} El resultado de la operación. Si ocurre un error, retorna un objeto con la propiedad `error`.
   */
  desactivateSeller = async ({ idSeller }) => {
    try {
      const result = await iManagerPgHandler.executeQuery({
        key: "desactivateSeller",
        params: [idSeller],
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  /**
   * Asigna un local a un vendedor.
   * @async
   * @param {Object} options - Las opciones para asignar el local.
   * @param {number} options.idSeller - El ID del vendedor.
   * @param {Array} [options.local=[]] - Los locales a asignar.
   * @returns {Promise<Object>} El resultado de la operación. Si ocurre un error, retorna un objeto con la propiedad `error`.
   */
  asignLocalSeller = async ({ idSeller, local = [] }) => {
    try {
      const localData = [...local];
      const querys = [];

      for (const key of localData) {
        const { idLocal } = key;
        const localInfo = !idLocal
          ? { key: "insertLocal", params: local, insertResult: true }
          : { id: idLocal, insertResult: true };
        const seller = { key: "asignLocalSeller", params: [idSeller] };

        localData.push(localInfo, seller);
      }
      const result = await iManagerPgHandler.transaction({ querys });
      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  /**
   * Crea un vendedor.
   *
   * @async
   * @param {Object} options - Las opciones para crear el vendedor.
   * @param {Object} options.person - La información de la persona.
   * @returns {Promise<Object>} El resultado de la operación. Si ocurre un error, retorna un objeto con la propiedad `error`.
   * @example
   * Ejemplo de la estructura de la persona
   * createSeller({person: {idPerson: 1}})
   * createSeller({person: {name: 'Juan', lastName: 'Perez', phone: '0412-1234567'}})
   */
  createSeller = async ({ person }) => {
    try {
      const { idPerson } = person;
      //   const { idLocal } = local;

      //   const personData = !idPerson
      //     ? await new personControl().createTo({
      //         option: "person",
      //         params: person,
      //       })
      //     : idPerson;

      //   const localData = !idLocal
      //     ? await new localControl().insertTo({ to: "local", params: [local] })
      //     : idLocal;

      //   const seller = await iManagerPgHandler.executeQuery({
      //     key: "insertSeller",
      //     params: [personData, localData],
      //   });

      //TODO: ASI LO HAGO CON TRANSACTION, PERO SE PUEDEN USAR LOS METODOS CONVENCIONALES
      //TODO: REVISAR QUE ABSOLUTAMENTE TODOS LOS INSERT RETORNEN EL DATO PRINCIPAL
      const personData = !idPerson
        ? { key: "insertPerson", params: person, insertResult: true }
        : { id: idPerson, insertResult: true };

      const sellerData = {
        key: "insertSeller",
        params: [personData],
        insertResult: true,
      };

      // Esto no va porque puede tener muchos locales

      const result = await iManagerPgHandler.transaction({
        querys: [...personData, ...sellerData],
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };
}

export default seller;
