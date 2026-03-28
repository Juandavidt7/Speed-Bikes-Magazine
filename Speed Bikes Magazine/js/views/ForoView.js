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

  renderPublicaciones() {
    const el = this.elements;
    if (!el.contenedor) return;
    
    const publicaciones = ForoModel.obtenerPublicaciones();
    el.contenedor.innerHTML = "";

    publicaciones.forEach((post, index) => {
      el.contenedor.innerHTML += `
        <div class="post">
          <button class="btn-delete-foro-icon" data-index="${index}" title="Eliminar publicación">🗑️</button>
          <p>${post.comentario}</p>
          <img src="${post.imagen}">
          <div class="acciones-post">
            <button class="btn-like-foro" data-index="${index}">❤️ Like</button>
          </div>
          <p>${post.likes} likes</p>
        </div>
      `;
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
