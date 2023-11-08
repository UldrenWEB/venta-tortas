'use strict'
import PgHandler from "../models/PgHandler.js"

class ManagerPgHandler {
    constructor({ config, querys }) {

        this.pgHandler = new PgHandler({ config })

        this.querys = querys;
    }

    returnByProp = async ({ key, params = undefined, prop }) => {
        try {
            let [result] = await this.pgHandler.executeQuery({
                query: this.query[key],
                params: params
            })

            return result[prop] ? result[prop] : false
        } catch (error) {
            return { error }
        }
    }

    //* Segun las filas que devuelva la consulta fue bien o mal
    execute = async ({ key, params = undefined }) => {
        try {
            let rowCount = await this.pgHandler.execute({
                query: this.querys[key],
                params: params
            })

            return rowCount > 0 ? true : false
        } catch (error) {
            return { error }
        }
    }

    executeQuery = async ({ key, params = undefined }) => {
        try {
            let result = await this.pgHandler.executeQuery({
                query: this.querys[key],
                params: params
            })

            return result;
        } catch (error) {
            return { error }
        }
    }

}

export default ManagerPgHandler
