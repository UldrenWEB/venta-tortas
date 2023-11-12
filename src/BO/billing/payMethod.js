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
      return result;
    } catch (error) {
      console.error(
        `Ocurrio un error en el metodo deletePayMethod: ${error.message} del objeto payMethods.js de billing`
      );
      return { error: error.message };
    }
  };

  #deleteBank = async ({ idBank }) => {
    try {
      const deletePayBank = { key: "deletePayBank", params: [idBank] };
      const deleteBank = { key: "deleteBank", params: [idBank] };

      const querys = [...deletePayBank, ...deleteBank];

      const result = await iManagerPgHandler.transaction({ querys });

      return result;
    } catch (error) {
      console.error(
        `Ocurrio un error en el metodo privado #deleteBank: ${error.message} del objeto payMethods.js de billing`
      );
      return { error: error.message };
    }
  };

  #deleteMethodOther = async ({ idOther }) => {
    try {
      const deletePayOther = { key: "deletePayOther", params: [idOther] };
      const deleteMethodOther = { key: "deleteMethodOther", params: [idOther] };

      const querys = [...deletePayOther, ...deleteMethodOther];

      const result = await iManagerPgHandler.transaction({ querys });

      return result;
    } catch (error) {
      console.error(
        `Ocurrio un error en el metodo privado #deleteMethodOther: ${error.message} del objeto payMethods.js de billing`
      );
      return { error: error.message };
    }
  };

  #deleteMethodBank = async ({ idMethodBank }) => {
    try {
      const deletePayBank = {
        key: "deletePayBankFromMethod",
        params: [idMethodBank],
      };
      const deleteMethodBank = {
        key: "deleteMethodBank",
        params: [idMethodBank],
      };

      const querys = [...deletePayBank, ...deleteMethodBank];

      const result = await iManagerPgHandler.transaction({ querys });

      return result;
    } catch (error) {
      console.error(
        `Ocurrio un error en el metodo privado #deleteMethodBank: ${error.message} del objeto payMethods.js de billing`
      );

      return { error: error.message };
    }
  };
}

export default payMethod;
