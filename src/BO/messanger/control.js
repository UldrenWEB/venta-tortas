'use strict'

import iManagerPgHandler from '../../data/instances/iManagerPgHandler.js'

class Control {
    getMessageBy = async (option, params) => {
        try {
            const optionLower = option.toLowerCase();
            const obj = {
                emisor: 'selectMessageByUserSe',
                date: 'selectMessageByDate',
                rangedate: 'selectMessageByRangeDate',
                type: 'selectMessageByTypeMessage',
                typeanduser: 'selectMessageByTypeAndUserSe'
            }
            if (obj[optionLower]) return false;
            const result = await iManagerPgHandler.executeQuery({
                key: obj[optionLower],
                params: params
            })

            return result;
        } catch (error) {
            return { error: error.message }
        }
    }

    getMessageToTypeBy = async ({ option, params }) => {
        try {
            const optionLower = option.toLowerCase();
            const obj = {
                receptor: 'selectMessageToTypeByUserRe',
                dateordermessage: 'orderMessageToTypeByDate'
            }
            if (obj[optionLower]) return false;

            const result = await iManagerPgHandler.executeQuery({
                key: obj[optionLower],
                params: params
            })

            return result;
        } catch (error) {
            return { error: error.message }
        }
    }

    getUserByMessage = async ({ params }) => {
        try {

            const result = await iManagerPgHandler.executeQuery({
                key: 'selectUserByMessage',
                params: params
            })

            return result;
        } catch (error) {
            return { error: error.message }
        }
    }

    getImageByMessage = async ({ params }) => {
        try {
            const result = await iManagerPgHandler.executeQuery({
                key: 'selectImageByMessage',
                params: params
            })

            return result;
        } catch (error) {
            return { error: error.message }
        }
    }
    getDateByMessage = async ({ params }) => {
        try {

            const result = await iManagerPgHandler.executeQuery({
                key: 'selectDateByMessage',
                params: params
            })

            return result;
        } catch (error) {
            return { error: error.message }
        }
    }

    insertTo = async ({ option, params }) => {
        try {
            const optionLower = option.toLowerCase();
            const obj = {
                message: 'insertNewMessage',
                messagenames: 'insertNewMessageSubconsulta',
                image: 'insertNewImage'
            }
            if (!obj[optionLower]) return false;

            const modified = await iManagerPgHandler.execute({
                key: obj[optionLower],
                params: params
            })

            return modified;
        } catch (error) {
            return { error: error.message }
        }
    }

    editTo = async ({ option, params }) => {
        try {
            const optionLower = option.toLowerCase();
            const obj = {
                message: 'updateMessage',
                typemessage: 'updateTypeMessage'
            }
            if (obj[optionLower]) return false;

            const modified = await iManagerPgHandler.execute({
                key: obj[optionLower],
                params: params
            })

            return modified;
        } catch (error) {
            return { error: error.message }
        }
    }

    deleteMessage = async ({ params }) => {
        try {
            //Primero buscamos si ese mensaje tiene una foto asociada
            const img = await iManagerPgHandler.returnByProp({
                key: 'selectImageByMessage',
                params: params
            })
            if (img) {
                const deleteImage = await iManagerPgHandler.execute({
                    key: 'deleteImage',
                    params: params
                })
                if (!deleteImage) return false;
            }

            const modified = await iManagerPgHandler.execute({
                key: 'deleteMessage',
                params: params
            })

            return modified;
        } catch (error) {
            return { error: error.message }
        }
    }


}

export default Control;



