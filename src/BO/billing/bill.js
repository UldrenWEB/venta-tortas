import iManagerPgHandler from "../../data/instances/iManagerPgHandler.js";

class bill {

  //<--- Se llama cada vez que se hace un pago, ve si ya toda la factura esta pagada para cambiar el estatus
  verifyPayBill = async ({ idBill }) => {
    try {
      const totalBill = await this.getTotal({
        option: 'bill',
        idBill
      })
      const totalPaid = await this.getTotal({
        option: 'paid',
        idBill
      })

      if (!totalBill || totalBill.error || !totalPaid || totalPaid.error) return false;

      const result = totalBill - totalPaid
      if (result <= 0) {
        console.log('Se cambiara el estado porque cumplio su deuda')
        const modified = await this.#changeStatusBill({
          idBill
        });

        if (!modified || modified.error) return false;

        return { debit: false };
      }

      return { debit: result }
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

  //!Params orden:[naSeller, naClient] 
  createBill = async ({ products = [], params, dateLimit }) => {
    try {
      console.log('Aqui productos', products)
      //True es que esta pendiente y false que esta pagada
      const dateNow = this.#getDateNow('mm/dd/yyyy');

      const statusDe = dateLimit == false ? 'pagada' : 'pendiente'

      const idStatus = await iManagerPgHandler.returnByProp({
        key: 'selectStatusBillByName',
        params: [statusDe],
        prop: 'id_status_bill'
      })

      const [resultId] = await iManagerPgHandler.execute({
        key: 'insertBill',
        params: [...params, idStatus, dateNow]
      })
      const idBill = resultId['id_bill']

      if (!idBill) return false;

      if (statusDe === 'pendiente') {
        const probe = await this.#addDebt({
          idBill: idBill,
          dateLimit: dateLimit
        })
        console.log('Probando crear la deuda', probe)
      }

      const insertProducts = await this.#insertRows({
        idBill,
        arrayProducts: products
      })
      if (!insertProducts || insertProducts.error) return false;

      return true;
    } catch (error) {
      return { error: error.message }
    }
  };

  #insertRows = async ({ idBill, arrayProducts }) => {
    try {
      Promise.all(arrayProducts.map(async (product) => {
        await iManagerPgHandler.execute({
          key: 'insertRowByIdBillAndDeProduct',
          params: [idBill, Number(product)]
        });
      }));

      return true;
    } catch (error) {
      console.log(error)
      return { error: error.message }
    }
  }

  //TypePay = bank || other
  //Cuando se pague se tiene que especificar el tipo de pago si sera de banco o de otro y adicional se tienen que pasar los parametros necesarios si sera a un banco pues el banco y el metodo de pago y si es a otro entonces el metodo de pago
  payBill = async ({ typePay, idBill, amount, params = [] }) => {
    try {
      const typePayLower = typePay.toLowerCase();
      const keyMethodPay = typePayLower === 'bank' ? 'insertPayBank' : 'insertPayOther'

      const that = await this.verifyPayBill({ idBill })

      if (!that.debit) return { errorPay: 'El usuario no debe' }

      if (that.error || !that) return { error: 'Hubo un error al verificar la deuda del cliente en el metodo verifyPayBill' }

      const pay = {
        key: 'insertPay',
        params: amount,
      }

      const methodPay = {
        key: keyMethodPay,
        params: params,
        insertResult: true
      }

      const reduceDebt = {
        key: 'reduceDebt',
        params: [amount, idBill]
      }

      const transaction = await iManagerPgHandler.transaction({
        querys: [pay, methodPay, reduceDebt]
      })

      return transaction;
    } catch (error) {
      return { error: error.message }
    }
  };

  //Aqui se agrega la deuda si se elige al momento de crear la factura
  //Iria
  #addDebt = async ({ idBill, dateLimit }) => {
    try {
      const totalBill = await this.getTotal({
        option: 'bill',
        idBill
      })

      console.log('Total de la factura', totalBill)
      const modified = await iManagerPgHandler.execute({
        key: 'insertDebt',
        params: [idBill, totalBill, dateLimit]
      })

      console.log('No se inserto bien la deuda verificar');
      return modified
    } catch (error) {
      return { error: error.message }
    }
  }

  #changeStatusBill = async ({ idBill }) => {
    try {
      const statusBill = await iManagerPgHandler.returnByProp({
        key: 'selectStatusByBill',
        params: [idBill],
        prop: 'de_status_bill'
      })
      const newStatus = statusBill === 'pendiente' ? 'pagada' : 'pendiente';

      const getIdStatus = await iManagerPgHandler.returnByProp({
        key: 'selectStatusBillByName',
        params: [newStatus]
      })

      const modified = await iManagerPgHandler.execute({
        key: 'updateStatusByBill',
        params: [idBill, getIdStatus]
      })

      return modified;
    } catch (error) {
      return { error: error.message }
    }
  };


  getItemsByBill = async ({ id }) => {
    try {
      const result = await iManagerPgHandler.executeQuery({
        key: 'selectAllItemsByBill',
        params: [id]
      })

      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  getAll = async ({ option }) => {
    try {
      const optionLower = option.toLowerCase();
      const options = {
        bills: 'selectAllBills',
        status: 'selectAllStatus',
        debt: 'selectAllDebts'
      }
      if (!options[optionLower]) return false;

      const result = await iManagerPgHandler.executeQuery({
        key: 'selectAllBills'
      })

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  seeBillsBy = async ({ option, params = [] }) => {
    try {
      const optionLower = option.toLowerCase();
      const options = {
        seller: 'selectBillBySeller',
        client: 'selectBillByClient',
        date: 'selectBillsByDate',
        status: 'selectBillsByStatus'
      }
      if (!options[optionLower]) return false;

      const result = await iManagerPgHandler({
        key: options[optionLower],
        params: params
      })

      return result;
    } catch (error) {
      return { error: error.message }
    }
  };

  getTotal = async ({ option, idBill }) => {
    try {
      const optionLower = option.toLowerCase();
      const options = {
        bill: "selectTotalByBill",
        paid: "selectTotalDebt",
        debt: "selectTotalPaid",
      };

      if (!options[optionLower]) return false;

      const total = await iManagerPgHandler.returnByProp({
        key: options[optionLower],
        params: [idBill],
        prop: 'total'
      });

      return total;
    } catch (error) {
      console.error(`Ocurrio un error en el metodo getInfo: ${error.message} del objeto bill.js de billing`);
      return { error: error.message }
    }
  };

  getPaysByBill = async ({ idBill }) => {
    try {
      const result = await iManagerPgHandler.executeQuery({
        key: 'selectAllPaidByBillConcat',
        params: [idBill]
      })

      return result;
    } catch (error) {
      return { error: error.message }
    }
  }

  //mm/dd/yyyy --> Este es el formato de la base de datos 
  #getDateNow = (format) => {
    let date = new Date();

    //*Crear las partes de la date
    let day = String(date.getDate()).padStart(2, "0");
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let year = date.getFullYear();

    //Se reemplaza para cambiar el formatadoo y los separres
    format = format.toLowerCase();
    format = format.replace("dd", day);
    format = format.replace("mm", month);
    format = format.replace("yyyy", year);

    return format;
  }
}

export default bill;
