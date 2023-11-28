import iManagerPgHandler from "../../data/instances/iManagerPgHandler.js";

class order {
  asignTypePay = async ({ idSeller, idTypePay }) => {
    try {
      const result = await iManagerPgHandler.execute({
        key: "asignTypeSalarySeller",
        params: [idSeller, idTypePay],
      });

      return result;
    } catch (error) {
      console.error(`Ocurrio un error en el metodo asignTypePay: ${error.message} del objeto order.js de seller`)
      return { error: error.message };
    }
  };

  paySeller = async ({ idSeller, ammountPay }) => {
    try {
      const result = await iManagerPgHandler.executeQuery({
        key: "paySeller",
        params: [idSeller, ammountPay],
      });

      return result;
    } catch (error) {
      console.error(`Ocurrio un error en el metodo paySeller: ${error.message} del objeto order.js de seller`)
      return { error: error.message };
    }
  };

  //Pending - FromSellers - ToSellers
  seePayments = async ({ option }) => {
    try {
      const optionLo = option.toLowerCase();

      const obj = {
        pendingPayments: "seePendingPayments",
        fromSellers: "seePaymentsFromSellers",
        toSellers: "seePaymentsToSellers",
      };

      if (!obj[optionLo]) return false;

      const result = await iManagerPgHandler.executeQuery({
        key: obj[optionLo],
      });

      return result;
    } catch (error) {
      console.error(`Ocurrio un error en el metodo seePayments: ${error.message} del objeto order.js de seller`)
      return { error: error.message };
    }
  };

  seeBillFromSeller = async ({ idSeller }) => {
    try {
      const result = await iManagerPgHandler.executeQuery({
        key: "seeBillFromSeller",
        params: [idSeller],
      });

      return result;
    } catch (error) {
      console.error(`Ocurrio un error en el metodo seeBillFromSeller: ${error.message} del objeto order.js de seller`)
      return { error: error.message };
    }
  };
}

export default order;
