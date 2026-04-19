import { CosmosHelper } from './CosmosHelper.js';

export const UserModel = {
  SESSION_KEY: 'speedbikes_session',

  /**
   * Registrar un nuevo usuario DIRECTAMENTE en la nube (Sin Servidor)
   */
  async registrarUsuario(nickname, motoFavorita, cilindraje) {
    const nuevoUsuario = {
      id: "user_" + Date.now() + "_" + Math.floor(Math.random() * 1000), // ID único obligatorio
      nickname: nickname.trim(),
      motoFavorita: motoFavorita.trim(),
      cilindraje: cilindraje.trim(),
      datos: "usuario",
      fecha: new Date().toISOString()
    };

    try {
        // Guardar directamente en la coleccion 'datos' via REST API
        const result = await CosmosHelper.request("POST", "datos", nuevoUsuario);
        return result;
    } catch (err) {
        console.error("Error en el registro directo:", err);
        throw new Error("Error de Azure: " + err.message + ". (Revisa la consola F12 para más detalles)");
    }
  },

  /**
   * Buscar un usuario por su nickname directamente en la nube
   */
  async buscarPorNickname(nickname) {
    try {
        // En la API REST nativa, buscar es traer todos y filtrar o usar un POST de SQL
        const result = await CosmosHelper.request("GET", "datos");
        const usuarios = result.Documents || [];
        return usuarios.find(u => u.nickname && u.nickname.toLowerCase() === nickname.toLowerCase());
    } catch (err) {
        console.error("Error al buscar usuario:", err);
        return null;
    }
  },

  // Gestión de sesión (LocalStorage) - Sigue igual
  iniciarSesion(usuario) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(usuario));
  },

  obtenerSesion() {
    const sesion = localStorage.getItem(this.SESSION_KEY);
    return sesion ? JSON.parse(sesion) : null;
  },

  cerrarSesion() {
    localStorage.removeItem(this.SESSION_KEY);
  }
};
