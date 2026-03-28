import { MotoModel } from '../models/MotoModel.js';

export const RevistaView = {
  // Inicializador que crea todas las tarjetas
  render() {
    this.renderSeccion(MotoModel.nuevas, "nuevasContainer");
    this.renderSeccion(MotoModel.clasicas, "clasicasContainer");
    this.renderSeccion(MotoModel.famosas, "famosasContainer");
  },

  renderSeccion(lista, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    
    // Limpia contenedor si ya había cosas renderizadas
    contenedor.innerHTML = "";

    lista.forEach((noticia, index) => {
      let key = contenedorId + index;
      let likes = MotoModel.getLikes(key);

      const div = document.createElement("div");
      div.classList.add("noticia");

      if (index % 2 !== 0) {
        div.classList.add("reverse");
      }

      div.innerHTML = `
        <img src="${noticia.imagen}">
        <div class="texto">
          <h3>${noticia.titulo}</h3>
          <p>${noticia.descripcion}</p>
          <button class="btn-like-moto" data-contenedor="${contenedorId}" data-index="${index}">❤️ Like</button>
          <p id="like_${contenedorId}${index}">${likes} likes</p>
        </div>
      `;

      contenedor.appendChild(div);
    });
  },

  // Método para actualizar exclusivamente el pequeño texto de LIKES del DOM
  updateLikesText(contenedorId, index, newLikes) {
    const likeElement = document.getElementById("like_" + contenedorId + index);
    if (likeElement) {
      likeElement.innerText = newLikes + " likes";
    }
  }
};
