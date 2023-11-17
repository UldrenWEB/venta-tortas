import iManagerPgHandler from "../../data/instances/iManagerPgHandler.js";

class bill {
  createBill = async () => {};

  //<--- Se llama cada vez que se hace un pago, ve si ya toda la factura esta pagada para cambiar el estatus
  #verifyPayBill = async ({ idBill }) => {
    try {
      const montoTotal = Number(
        await this.getInfo({ option: "totalBill", idBill })
      );
      const totalPays = Number(
        await this.getInfo({ option: "totalPays", idBill })
      );

      return totalPays < montoTotal
        ? false
        : await this.#changeStatusBill({ idBill, status: "Pagada" });
    } catch (error) {
      console.error(
        `Ocurrio un error en el metodo #verifyPayBill: ${error.message} del objeto bill.js de billing`
      );
      return { error: error.message };
    }
  };

  /*Hay que especificar
   * @Metodo de pago
   * Monto
   * Id de la factura
   * Id del usuario
   */
  payBill = async () => {};

  #payBank = async () => {};

  #payOther = async () => {};

  calculateTotal = async ({ idBill }) => {};

  #changeStatusBill = async ({ idBill, status }) => {};

  deleteBill = async () => {};

  seeProductsBill = () => {};

  seeBillsBy = async () => {};

  addRowBill = async () => {};

  deleteRowBill = async () => {};

  //! Esta va a obtener la deuda total ademas del monto total por factura
  getTotal = async () => {};

  getInfo = async ({ option, idBill }) => {
    try {
      const options = {
        totalBill: "totalBill",
        totalPays: "totalPays",
        totalDebt: "totalDebt",
      };

      if (!options[option]) return false;

      const result = await iManagerPgHandler.execute({
        key: options[option],
        params: [idBill],
      });

      return result;
    } catch (error) {
        console.error(`Ocurrio un error en el metodo getInfo: ${error.message} del objeto bill.js de billing`);
        return {error: error.message}
    }
  };
}

export default bill;
