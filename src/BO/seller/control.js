//TODO: RECORDAR VALIDAR CON SCHEMAS TODO LO QUE ENTRE POR PARAMETROS
import iManagerPgHandler from "../../data/instances/iManagerPgHandler.js";
class seller {
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

  //Permite crear tambien persona o local
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
