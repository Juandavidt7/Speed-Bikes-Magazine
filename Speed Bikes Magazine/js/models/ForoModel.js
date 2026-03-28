export const ForoModel = {
  obtenerPublicaciones() {
    return JSON.parse(localStorage.getItem('foro')) || [];
  },

  guardarPublicaciones(publicaciones) {
    localStorage.setItem('foro', JSON.stringify(publicaciones));
  },

  agregarPublicacion(imagenSrc, comentario) {
    const publicaciones = this.obtenerPublicaciones();
    const nuevaPublicacion = {
      imagen: imagenSrc,
      comentario: comentario,
      likes: 0
    };
    publicaciones.unshift(nuevaPublicacion);
    this.guardarPublicaciones(publicaciones);
  },

  darLike(index) {
    const publicaciones = this.obtenerPublicaciones();
    publicaciones[index].likes++;
    this.guardarPublicaciones(publicaciones);
  },

  eliminarPublicacion(index) {
    const publicaciones = this.obtenerPublicaciones();
    publicaciones.splice(index, 1);
    this.guardarPublicaciones(publicaciones);
  }
};
