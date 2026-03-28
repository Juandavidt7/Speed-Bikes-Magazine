import { MotoModel } from '../models/MotoModel.js';
import { ForoModel } from '../models/ForoModel.js';
import { RevistaView } from '../views/RevistaView.js';
import { ForoView } from '../views/ForoView.js';
import { NavView } from '../views/NavView.js';

export const AppController = {
  // Estado local para la cámara
  streamCamara: null,
  fotoCapturada: null,

  init() {
    // 1. Renderizar Estado Inicial Vistas
    RevistaView.render();
    ForoView.renderPublicaciones();

    // 2. Registrar el Service Worker (Buena práctica PWA)
    this.registrarServiceWorker();

    // 3. Bind events (Enlazar eventos de botones dinámicos generados)
    this.bindEvents();

    // 4. Exponer funciones al Window Global para que los "onclick" del HTML sigan funcionando
    // (Ya que los módulos ES6 encapsulan su scope limitando el acceso global).
    this.exponerFuncionesGlobales();
  },

  registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(registration => console.log('SW registrado con éxito:', registration.scope))
          .catch(err => console.log('Fallo al registrar SW:', err));
      });
    }
  },

  exponerFuncionesGlobales() {
    // Mapeo Estático de Vistas/Navegación
    window.cambiarPantalla = (id, btn) => NavView.cambiarPantalla(id, btn);
    window.cerrarDropdown = () => NavView.cerrarDropdown();
    window.irAContacto = () => NavView.irAContacto();

    // Mapeo Dinámico Foro / Cámara
    window.iniciarCamara = () => this.iniciarCamara();
    window.tomarFoto = () => this.tomarFoto();
    window.publicarMoto = () => this.publicarMoto();
  },

  bindEvents() {
    // Patrón de Event Delegation para manejar los clics dinámicos en clases repetidas
    document.addEventListener('click', (e) => {
      // Si se hizo click a Like en Revista
      if (e.target.matches('.btn-like-moto')) {
        const contenedorId = e.target.getAttribute('data-contenedor');
        const index = e.target.getAttribute('data-index');
        const key = contenedorId + index;
        
        const nuevosLikes = MotoModel.addLike(key);
        RevistaView.updateLikesText(contenedorId, index, nuevosLikes);
      }
      
      // Si se hizo click a Like en el Foro
      if (e.target.matches('.btn-like-foro')) {
        const index = e.target.getAttribute('data-index');
        ForoModel.darLike(index);
        ForoView.renderPublicaciones(); // Refrescamos vista
      }

      // Si se hizo click a Eliminar en el Foro (Icono pequeño)
      if (e.target.closest('.btn-delete-foro-icon')) {
        const btn = e.target.closest('.btn-delete-foro-icon');
        const index = parseInt(btn.getAttribute('data-index'), 10);
        if (confirm('¿Estás seguro de que deseas eliminar este registro compartido de la comunidad?')) {
          ForoModel.eliminarPublicacion(index);
          ForoView.renderPublicaciones(); // Refrescamos vista
        }
      }
    });

    // Escuchar el cambio en el Input Nativo para la cámara HTTP móvil (Fallback)
    const capturaNativa = ForoView.elements.capturaNativa;
    if (capturaNativa) {
      capturaNativa.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.fotoCapturada = event.target.result;
            ForoView.mostrarPreviewGenerado(this.fotoCapturada);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  },

  /* ============================
     LÓGICA DEL CONTROLADOR PARA CÁMARA Y FORO
     ============================ */
  
  iniciarCamara() {
    ForoView.elements.fileInput.value = ''; // Limpiamos campo
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          this.streamCamara = stream;
          ForoView.mostrarCamara(stream);
          this.fotoCapturada = null;
        })
        .catch(() => {
          // Fallback nativo
          ForoView.elements.capturaNativa.click();
        });
    } else {
      ForoView.elements.capturaNativa.click();
    }
  },

  tomarFoto() {
    const el = ForoView.elements;
    // Dimensiones proporcionales del stream
    el.canvas.width = el.video.videoWidth;
    el.canvas.height = el.video.videoHeight;
    
    // Dibujado del frame
    const ctx = el.canvas.getContext('2d');
    ctx.drawImage(el.video, 0, 0, el.canvas.width, el.canvas.height);
    
    this.fotoCapturada = el.canvas.toDataURL('image/png');
    ForoView.mostrarPreviewGenerado(this.fotoCapturada);
    
    // Apagar webcam
    this.detenerCamara();
    ForoView.ocultarCamara();
  },

  detenerCamara() {
    if (this.streamCamara) {
      this.streamCamara.getTracks().forEach(track => track.stop());
      this.streamCamara = null;
    }
  },

  publicarMoto() {
    const archivo = ForoView.elements.fileInput.files[0];
    const comentario = ForoView.elements.comentarioInput.value;

    if ((!archivo && !this.fotoCapturada) || comentario === "") {
      alert("Sube una imagen o toma una foto y escribe las características de la moto.");
      return;
    }

    if (this.fotoCapturada) {
      ForoModel.agregarPublicacion(this.fotoCapturada, comentario);
      this.limpiarTrasPublicar();
    } else if (archivo) {
      const reader = new FileReader();
      reader.onload = (e) => {
        ForoModel.agregarPublicacion(e.target.result, comentario);
        this.limpiarTrasPublicar();
      };
      reader.readAsDataURL(archivo);
    }
  },

  limpiarTrasPublicar() {
    this.fotoCapturada = null;
    ForoView.limpiarFormulario();
    ForoView.renderPublicaciones();
  }
};
