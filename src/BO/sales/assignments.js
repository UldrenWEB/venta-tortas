"use strict";

import iManagerPgHandler from "../../data/instances/iManagerPgHandler.js";

//Todo: Si tienes metodos privados en la clase irian de ultimo
class Assignment {
  constructor() {}

  getAllAssignment = async () => {
    try {
      const result = await iManagerPgHandler.executeQuery({
        key: "selectAllAssignment",
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  //Todo: IMPORTANTE (para este metodo ver los querys) para pasar los parametros ya que maneja tantos querys de busqueda, esto para realizar diferentes funciones en el front
  getAssignmentByCondition = async ({ option, params }) => {
    try {
      const optionLower = option.toLowerCase();
      const obj = {
        seller: "selectAssignmentBySeller",
        client: "selectAssignmentByClient",
        product: "selectAssignmentByIdProduct",
        presentation: "selectAssignmentByIdPresentation",
        nameclientinit: "selectAssignmentByNameClientInit",
        nameclientmid: "selectAssignmentByNameClientMid",
        nameclientend: "selectAssignmentByNameClientEnd",
        namesellerinit: "selectAssignmentByNameSellerInit",
        namesellermid: "selectAssignmentByNameSellerMid",
        namesellerend: "selectAssignmentByNameSellerEnd",
        nameproductinit: "selectAssignmentByNameProductInit",
        nameproductmid: "selectAssignmentByNameProductMid",
        nameproductend: "selectAssignmentByNameProductEnd",
        namepresentationtinit: "selectAssignmentByNamePresentationInit",
        namepresentationtmid: "selectAssignmentByNamePresentationMid",
        namepresentationtend: "selectAssignmentByNamePresentationEnd",
        date: "selectAssignmentByDate",
        rangedate: "selectAssignmentByRangeDate",
      };
      if (!obj[optionLower]) return false;

      const result = await iManagerPgHandler.executeQuery({
        key: obj[optionLower],
        params: params,
      });

      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  //?option: state || assignment
  //?params: deState || idPersonCl, idPersonSe, idProductSale, idState
  insertAssignmentTo = async ({ option, params }) => {
    try {
      const optionLower = option.toLowerCase();
      const dateNow = this.#getDateNow("yyyy/mm/dd");
      const obj = {
        state: "insertStateAssignment",
        assignment: "insertAssignment",
      };
      if (!obj[optionLower]) return false;

      const newParams = optionLower === "state" ? params : [...params, dateNow];

      const modified = await iManagerPgHandler.execute({
        key: obj[optionLower],
        params: newParams,
      });

      return modified;
    } catch (error) {
      return { error: error.message };
    }
  };

  //TODO: Aqui se pone solo con el id de la asignacion y el id del estado, esto asi porque en la vista se tienen que mostrar las diferentes asignaciones para poder cambiar algun estado asi como tambien se debe poder ver los estados disponibles a elegir
  updateStateAssignment = async ({ params }) => {
    try {
      const modified = await iManagerPgHandler.execute({
        key: "updateStateAssignment",
        params: params,
      });

      return modified;
    } catch (error) {
      return { error: error.message };
    }
  };

  //?option: state || assignment
  //?params: idStateAssignment || idAssignment
  deleteAssignmentOrState = async ({ option, params }) => {
    try {
      const optionLower = option.toLowerCase();
      const obj = {
        state: "deleteStateAssignment",
        assignment: "deleteAssignment",
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

  //?format: "yyyy/mm/dd" || "dd/mm/yyyy" || ...
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
  };
}

export default Assignment;