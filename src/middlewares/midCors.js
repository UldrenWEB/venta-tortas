import cors from "cors"
/**
 * Middleware para permitir el acceso a recursos de diferentes orígenes.
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {Object} res - El objeto de respuesta HTTP.
 * @param {Function} next - La función para pasar el control al siguiente middleware.
 * @returns {void} No devuelve nada.
 */
const midCors = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  cors({credentials: true, origin: true})(req, res, next)
    // next(); <<-- Aqui no hace falta el next, ya cors la llama
}

export default midCors;