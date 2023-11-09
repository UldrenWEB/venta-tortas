'use strict'

import iManagerPgHandler from '../../data/instances/iManagerPgHandler.js'

class Control {
    constructor() { } //Todo: Se puede quitar tambien

    //?by Route || Person
    //?Params: idPerson || idRoute
    getLocalBy = async ({ by, params }) => {
        try {
            const byLower = by.toLowerCase();
            const obj = {
                person: 'selectLocalByPerson',
                route: 'selectLocalByRoute',
            }

            const verify = obj[byLower] ? obj[byLower] : false;
            if (!verify) return verify;

            const result = await iManagerPgHandler.executeQuery({
                key: verify,
                params: params
            })

            return result;
        } catch (error) {
            return { error }
        }
    }

    //?Params: idLocal
    getRouteByLocal = async ({ params }) => {
        try {

            const result = await iManagerPgHandler.executeQuery({
                key: 'selectRouteByLocal',
                params: params
            })

            return result;
        } catch (error) {
            return { error }
        }
    }

    //?of: local (allLocals)|| route(allRoutes) || localroute (allTwo)
    getAllOf = async ({ of }) => {
        try {
            const ofLower = of.toLowerCase();
            const obj = {
                local: 'selectAllLocal',
                route: 'selectAllRoute',
                localroute: 'selectAllRouteAndLocal',
            }

            const verify = obj[ofLower] ? obj[ofLower] : false
            if (!verify) return verify;

            const result = await iManagerPgHandler.executeQuery({
                key: verify,
            })

            return result;
        } catch (error) {
            return { error }
        }
    }

    //?to: local || route
    //?params: insertar en local || routen (nombre o descripcion)
    insertTo = async ({ to, params }) => {
        try {
            const toLower = to.toLowerCase()
            const obj = {
                local: 'insertLocal',
                route: 'insertRoute',
            }
            const verify = obj[toLower] ? obj[toLower] : false;
            if (!verify) return verify;

            const modified = await iManagerPgHandler.execute({
                key: verify,
                params: params
            })

            return modified;
        } catch (error) {
            return { error }
        }
    }

    //?params: idPerson, idLocal (Esto se deberia obtener de los select)
    asignPersonLocal = async ({ params }) => {
        try {
            const modified = await iManagerPgHandler.execute({
                key: 'insertPersonLocal',
                params: params
            })

            return modified;
        } catch (error) {
            return { error }
        }
    }

    //?to: local || route (para editar ruta o local)
    //?params: (solo se puede editar el nombre de la ruta y local)
    editTo = async ({ to, params }) => {
        try {
            const toLower = to.toLowerCase();
            const obj = {
                local: 'updateLocal',
                route: 'updateRoute',
            }

            const verify = obj[toLower] ? obj[toLower] : false
            if (!verify) return verify;

            const modified = await iManagerPgHandler.execute({
                key: verify,
                params: params,
            })

            return modified;
        } catch (error) {
            return { error }
        }
    }

    //?params: idRoute
    deleteRoute = async ({ params }) => {
        try {
            const deleteRoute = {
                key: 'deleteRoute',
                params: params
            }

            const deleteLocal = {
                key: deleteLocalByRoute,
            }

            const querys = [deleteRoute, deleteLocal];
            const modified = await iManagerPgHandler.transaction({
                querys: querys
            })

            return modified;
        } catch (error) {
            return { error }
        }
    }

    //?params idLocal
    deleteLocal = async ({ params }) => {
        try {
            const deleteLocal = {
                key: 'deleteLocal',
                params: params
            }

            const deletePersonLocal = {
                key: 'deletePersonLocalByLocal'
            }

            const querys = [deleteLocal, deletePersonLocal]
            const modified = await iManagerPgHandler.transaction({
                querys: querys
            })

            return modified;
        } catch (error) {
            return { error }
        }
    }

}

export default Control
