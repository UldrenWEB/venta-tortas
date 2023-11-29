"use strict";

import iManagerPgHandler from "../../data/instances/iManagerPgHandler.js";

class products {
  constructor() { }

  getAll = async ({ option }) => {
    try {
      const optionLower = Array.isArray(option) ? option[0].toLowerCase() : option.toLowerCase();
      const obj = {
        product: "selectAllProduct",
        presentation: "selectAllPresentation",
        productsale: "selectAllProductsSale",
      };

      if (!obj[optionLower]) return false;

      const result = await iManagerPgHandler.executeQuery({
        key: obj[optionLower]
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  //?condition: presentation, amount, range, largerthan, lessthan
  //?params: idPresentation, montoEspecifico, rangosDeMonto, mayorQueElMonto, menorQueElMonto
  getAllProductByCondition = async ({ condition, params }) => {
    try {
      console.log('Aqui params', params);
      const condiLower = condition.toLowerCase();
      const obj = {
        presentation: "selectProductSaleByPresentation",
        amount: "selectProductSaleByAmount",
        rangeamount: "selectProductSaleByRangeAmount",
        largerthanamount: "selectProductLargerThanAmount",
        lessthanamount: "selectProductLessThanAmount",
      };

      if (!obj[condiLower]) return false;

      const result = await iManagerPgHandler.executeQuery({
        key: obj[condiLower],
        params: [params],
      });
      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  //?params: idProduct
  getAllPresentationByProduct = async ({ params }) => {
    try {
      const result = await iManagerPgHandler.executeQuery({
        key: "selectPresentationByProduct",
        params: [params],
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  //?params: idProduct, idPresentation
  getAmountByProductAndPresentation = async ({ idProduct }) => {
    try {
      const amount = await iManagerPgHandler.returnByProp({
        key: "selectAmountByProduct",
        params: [idProduct],
        prop: 'am_product_sale'
      });

      return amount;
    } catch (error) {
      return { error: error.message };
    }
  };

  //?option: product, presentation, productsale
  //?params: deProduct || dePresentation || (idProducto, idPresentacion, monto)
  insertTo = async ({ option, params }) => {
    console.log(option, params)
    try {
      const optionLower = option.toLowerCase();
      const obj = {
        product: "insertProduct",
        presentation: "insertPresentation",
        productsale: "insertProductSale",
      };

      if (!obj[optionLower]) return false;

      const modified = await iManagerPgHandler.execute({
        key: obj[optionLower],
        params: params,
      });

      return modified;
    } catch (error) {
      return { error: error.message };
    }
  };

  updateToProductSale = async ({ params }) => {
    try {
      //Destrurando params para parsear a null
      const [presentation, amount, idProduct] = params

      if (presentation == null) presentation = null;
      if (amount == null) amount = null;
      if (idProduct == null) idProduct = null;

      const modified = await iManagerPgHandler.execute({
        key: updateProductSale,
        params: [presentation, amount, idProduct],
      });

      return modified;
    } catch (error) {
      return { error: error.message };
    }
  }

  //*Poner parametros de query en la posicion que se indica abajo
  //?option: product, presentation, amountproduct
  //?params: idProduct, newDeProduct || idPresentation, newDePresentation || idProduct, idPresentation, newAmount
  updateTo = async ({ option, params }) => {
    try {
      const optionLower = option.toLowerCase();
      const obj = {
        product: "updateProduct",
        presentation: "updatePresentation",
        amountproduct: "updateAmountProductSale",
      };
      if (!obj[optionLower]) return false;

      const modified = await iManagerPgHandler.execute({
        key: obj[optionLower],
        params: params,
      });

      return modified;
    } catch (error) {
      return { error: error.message };
    }
  };

  //?option: product || presentation
  //?params: idProduct || idPresentation
  deleteTo = async (option, params) => {
    try {
      const optionLower = option.toLowerCase();
      const obj = {
        product: ["deleteProduct", "deleteProductSaleByProduct"],
        presentation: ["deletePresentation", "deleteProductSaleByPresentation"],
      };
      if (!obj[optionLower]) return false;

      const [key, key2] = obj[optionLower];

      const delete1 = { key: key, params: params, insertResult: true };
      const delete2 = { key: key2 };

      const querys = [delete1, delete2];
      const modified = await iManagerPgHandler.transaction({
        querys: querys,
      });

      if (modified.command === "COMMIT") return true;
    } catch (error) {
      return { error: error.message };
    }
  };

  //*Para borrar un producto venta que es delicado tiene que ser con su id de produc_sale
  //?params: idProductSale
  deleteProductSale = async ({ id }) => {
    try {
      const modified = await iManagerPgHandler.execute({
        key: "deleteProductSale",
        params: [id],
      });

      return modified;
    } catch (error) {
      return { error: error.message };
    }
  };
}

export default products;
