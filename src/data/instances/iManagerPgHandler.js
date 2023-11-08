import ManagerPgHandler from '../../components/ManagerPgHandler.js'
import importJson from '../../utils/importJson.js'

const config = importJson({ path: '../data/json/config-pg.json' })
const querys = importJson({ path: '../data/json/querys.json' })

/**
 * Instancia de la clase PgHandler para manejar la conexión y consultas a la base de datos PostgreSQL.
 * @type {ManagerPgHandler}
 */
const manager = new ManagerPgHandler({ config, querys })

export default manager