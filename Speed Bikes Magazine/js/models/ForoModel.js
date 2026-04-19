const STORAGE_KEY = 'speed_bikes_foro_posts';

export const ForoModel = {
  /**
   * Obtener todas las publicaciones del foro directamente del almacenamiento local
   */
  async obtenerPublicaciones() {
    try {
      const posts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      // Ordenar por fecha descendente (más recientes primero)
      return posts.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    } catch (err) {
      console.error("Error al obtener publicaciones del foro:", err);
      return [];
    }
  },

  /**
   * Agregar una nueva publicación al almacenamiento local
   */
  async agregarPublicacion(imagenSrc, comentario) {
    const nuevaPublicacion = {
      id: "post_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      imagen: imagenSrc,
      comentario: comentario,
      likes: 0,
      fecha: new Date().toISOString()
    };

    try {
      const posts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      posts.push(nuevaPublicacion);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
      return nuevaPublicacion;
    } catch (err) {
      console.error("Error al publicar en el foro:", err);
      throw new Error("No se pudo guardar la publicación en el cache local.");
    }
  },

  /**
   * Dar LIKE a una publicación en almacenamiento local
   */
  async darLike(id) {
    try {
      const posts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const index = posts.findIndex(p => p.id === id);
      
      if (index !== -1) {
        posts[index].likes = (posts[index].likes || 0) + 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        return posts[index]; // Retornamos el post actualizado
      }
      throw new Error("Publicación no encontrada.");
    } catch (err) {
      console.error("Error al dar like:", err);
      throw err;
    }
  },

  /**
   * Eliminar una publicación del almacenamiento local
   */
  async eliminarPublicacion(id) {
    try {
      let posts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      posts = posts.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (err) {
      console.error("Error al eliminar publicacion:", err);
      throw new Error("No se pudo eliminar de la memoria local.");
    }
  }
};
