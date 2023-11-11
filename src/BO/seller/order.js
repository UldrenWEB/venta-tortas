class order {
  asignTypePay = async ({ idSeller, idTypePay }) => {
    try {
      const result = await iManagerPgHandler.executeQuery({
        key: "asignTypePaySeller",
        params: [idSeller, idTypePay],
      });

      return result;
    } catch (error) {
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
      return { error: error.message };
    }
  };

  seeBillFromSeller = async ({ idSeller }) => {};
}

export default order;
