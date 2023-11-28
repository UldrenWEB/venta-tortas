import iManagerPgHandler from "../../data/instances/iManagerPgHandler.js";

class payMethod {

  getAll = async ({ option }) => {
    try {
      const optionLower = option.toLowerCase();
      const obj = {
        bank: ["selectAllBanks"],
        methodbank: ["selectAllMethodBank"],
        methodother: ["selectAllMethodOther"],
        bankinactive: ['selectAllBankByStatus', 2],
        bankactive: ['selectAllBankByStatus', 1],
        methodotherinactive: ["selectAllMethodOtherByStatus", 2],
        methodotheractive: ["selectAllMethodOtherByStatus", 1],
        methodbankinactive: ['selectAllMethodBankByStatus', 2],
        methodbankactive: ['selectAllMethodBankByStatus', 1],
      };
      if (!obj[optionLower]) return false;

      const [query, param] = obj[optionLower]
      const result = await iManagerPgHandler.executeQuery({
        key: query,
        params: !param ? param : [param],
      });
      return result;
    } catch (error) {
      console.error(
        `Ocurrio un error en el metodo getBy: ${error.message} del objeto payMethods.js de billing`
      );
      return { error: error.message };
    }
  };

  //? option: - Bank - methodOther - methodBank
  //* Bank - params
  addTo = async ({ option, params }) => {
    try {
      const optionLower = option.toLowerCase();
      const obj = {
        bank: "insertBank",
        methodother: "insertPayMethodOther",
        methodbank: "insertPayMethodBank",
      };

      if (!obj[optionLower]) return false;

      const result = await iManagerPgHandler.execute({
        key: obj[optionLower],
        params: params,
      });

      return result;
    } catch (error) {
      console.error(
        `Ocurrio un error en el metodo addTo: ${error.message} del objeto payMethods.js de billing`
      );
      return { error: error.message };
    }
  };

  //? option: - Bank - methodOther - methodBank
  editTo = async ({ option, params }) => {
    try {
      const optionLower = option.toLowerCase();
      const obj = {
        bank: "updateBank",
        methodother: "updateMethodOther",
        methodbank: "updateMethodBank",
      };

      if (!obj[optionLower]) return false;

      const result = await iManagerPgHandler.execute({
        key: obj[optionLower],
        params,
      });

      return result;
    } catch (error) {
      console.error(
        `Ocurrio un error en el metodo editTo: ${error.message} del objeto payMethods.js de billing`
      );
      return { error: error.message };
    }
  };

  //TODO: AQUI FALTA EL DEL BANCO QUE AHORA TAMBIEN TIENE ESTATUS 
  //? option: - methodBank - methodOther
  setStatusPayMethod = async ({ option, value }) => {
    try {
      const optionLower = option.toLowerCase();
      const status = {
        enable: 1,
        disable: 2,
      };

      const obj = {
        bank: 'updateStatusBank',
        methodbank: "updateStatusMethodBank",
        methodother: "updateStatusMethodOther"
      };

      if (!obj[optionLower]) return false;
      const statusParam = value ? status['enable'] : status['disable'];

      const result = await iManagerPgHandler.execute({
        key: obj[optionLower],
        params: [statusParam],
      });

      return result;
    } catch (error) {
      console.error(
        `Ocurrio un error en el metodo setStatusMethod: 
        ${error.message} del objeto payMethods.js de billing`
      );
      return { error: error.message };
    }
  };
}
export default payMethod;
