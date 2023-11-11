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

  getSellerBy = async ({ option = "default", params }) => {
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
        params: params,
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
}

export default seller;
