import iManagerPgHandler from "../../data/instances/iManagerPgHandler.js";

class payMethod {
  //? option: - Bank - methodOther - methodBank
  //* Bank - params
  addTo = async ({ option, params }) => {
    try {
      const optionLower = option.toLowerCase();
      const obj = {
        bank: "insertBank",
        methodOther: "insertMethodOther",
        methodBank: "insertMethodBank",
      };

      if (!obj[optionLower]) return false;

      const result = await iManagerPgHandler.execute({
        key: obj[optionLower],
        params,
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
        methodOther: "updateMethodOther",
        methodBank: "updateMethodBank",
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

  //? option: - methodBank - methodOther
  setStatusPayMethod = async ({ option, value }) => {
    try {
      const status = {
        active: 1,
        inactive: 2,
      };

      const optionLower = option.toLowerCase();

      const obj = {
        methodBank: "updateStatusMethodBank",
        methodOther: "updateStatusMethodOther",
      };

      if (!obj[optionLower]) return false;

      const statusParam = value ? status.active : status.inactive;

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

  //esto borra en cascada todo lo relacionado a ese registro
  deletePayMethod = async ({ option, id }) => {
    try {
      const optionLower = option.toLowerCase();
      const obj = {
        bank: this.#deleteBank,
        methodOther: this.#deleteMethodOther,
        methodBank: this.#deleteMethodBank,
      };

      if (!obj[optionLower]) return false;
      
      const result = await obj[optionLower]({ id });
      return result
    } catch (error) {
      console.error(`Ocurrio un error en el metodo deletePayMethod: ${error.message} del objeto payMethods.js de billing`)
      return {error: error.message}
    }
  }

  #deleteBank = async ({ id }) => { }

  #deleteMethodOther = async ({ id }) => { }  

  #deleteMethodBank = async ({ id }) => { }
}

export default payMethod;
