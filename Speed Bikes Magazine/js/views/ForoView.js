import { ForoModel } from '../models/ForoModel.js';

export const ForoView = {
  // Referencias a elementos comunes
  get elements() {
    return {
      contenedor: document.getElementById("foroContainer"),
      video: document.getElementById('videoCamara'),
      camaraContainer: document.getElementById('camaraContainer'),
      preview: document.getElementById('previewFoto'),
      fileInput: document.getElementById('imagenMoto'),
      capturaNativa: document.getElementById('capturaNativa'),
      canvas: document.getElementById('canvasFoto'),
      comentarioInput: document.getElementById("comentarioMoto")
    };
  },

  /**
   * Renderizar dinamicamente las publicaciones desde el servidor (Cosmos DB)
   */
  async renderPublicaciones() {
    const el = this.elements;
    if (!el.contenedor) return;
    
    el.contenedor.innerHTML = '<p style="text-align:center; color: #aaa;">Cargando comunidad...</p>';
    
    const publicaciones = await ForoModel.obtenerPublicaciones();
    el.contenedor.innerHTML = "";

    if (publicaciones.length === 0) {
        el.contenedor.innerHTML = '<p style="text-align:center; color: #888;">Aún no hay publicaciones. ¡Sé el primero!</p>';
        return;
    }

    publicaciones.forEach((post) => {
      const div = document.createElement("div");
      div.classList.add("post");
      div.innerHTML = `
          <button class="btn-delete-foro-icon" data-id="${post.id}" title="Eliminar publicación">🗑️</button>
          <p>${post.comentario}</p>
          <img src="${post.imagen}" alt="Moto publicada">
          <div class="acciones-post">
            <button class="btn-like-foro" data-id="${post.id}">❤️ Like</button>
          </div>
          <p id="likes-${post.id}">${post.likes || 0} likes</p>
      `;
      el.contenedor.appendChild(div);
    });
  },

  limpiarFormulario() {
    const el = this.elements;
    el.comentarioInput.value = "";
    el.fileInput.value = "";
    if (el.capturaNativa) el.capturaNativa.value = "";
    el.preview.style.display = "none";
    el.preview.src = "";
  },

  mostrarCamara(stream) {
    const el = this.elements;
    el.video.srcObject = stream;
    el.camaraContainer.style.display = 'flex';
    el.preview.style.display = 'none';
    if(el.capturaNativa) el.capturaNativa.value = '';
  },

  ocultarCamara() {
    this.elements.camaraContainer.style.display = 'none';
  },

  mostrarPreviewGenerado(dataURL) {
    const el = this.elements;
    el.preview.src = dataURL;
    el.preview.style.display = 'block';
  }
};
