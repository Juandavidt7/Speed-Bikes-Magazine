import { MotoModel } from '../models/MotoModel.js';
import { ForoModel } from '../models/ForoModel.js';
import { UserModel } from '../models/UserModel.js';
import { RevistaView } from '../views/RevistaView.js';
import { ForoView } from '../views/ForoView.js';
import { NavView } from '../views/NavView.js';
import { LoginView } from '../views/LoginView.js';

export const AppController = {
  // Estado local para la cámara
  streamCamara: null,
  fotoCapturada: null,

  init() {
    // 1. Verificar si hay sesión activa para decidir el flujo de inicio
    this.verificarSesion();

    // 2. Registrar el Service Worker (Buena práctica PWA)
    this.registrarServiceWorker();

    // 3. Bind events (Enlazar eventos de botones dinámicos generados)
    this.bindEvents();

    // 4. Exponer funciones al Window Global para que los "onclick" del HTML sigan funcionando
    // (Ya que los módulos ES6 encapsulan su scope limitando el acceso global).
    this.exponerFuncionesGlobales();
  },

  /**
   * Verificar si hay sesión activa:
   * - Si hay sesión → Renderizar app + mostrar badge con nickname
   * - Si no hay sesión → Mostrar modal de login/registro
   */
  verificarSesion() {
    const sesion = UserModel.obtenerSesion();

    if (sesion) {
      // Usuario ya logueado: renderizar la app normalmente
      this.iniciarApp(sesion);
    } else {
      // No hay sesión: mostrar modal de login
      this.mostrarLogin();
    }
  },

  /**
   * Mostrar el modal de login y enlazar sus eventos
   */
  mostrarLogin() {
    LoginView.renderModal();
    this.bindLoginEvents();
  },

  /**
   * Iniciar la aplicación completa tras un login exitoso
   * @param {object} usuario - Datos del usuario logueado
   */
  async iniciarApp(usuario) {
    // Renderizar vistas principales
    RevistaView.render();
    await ForoView.renderPublicaciones();

    // Mostrar el badge del nickname en el header
    LoginView.mostrarNicknameBadge(usuario);

    // Enlazar el botón de cerrar sesión
    this.bindLogoutEvent();
  },

  /**
   * Enlazar todos los eventos del formulario de login
   */
  bindLoginEvents() {
    const el = LoginView.elements;
    if (!el.tabRegistro) return;

    // Tabs: Alternar entre Registro y Acceso
    el.tabRegistro.addEventListener('click', () => {
      el.tabRegistro.classList.add('active');
      el.tabAcceso.classList.remove('active');
      el.formRegistro.style.display = 'block';
      el.formAcceso.style.display = 'none';
    });

    el.tabAcceso.addEventListener('click', () => {
      el.tabAcceso.classList.add('active');
      el.tabRegistro.classList.remove('active');
      el.formAcceso.style.display = 'block';
      el.formRegistro.style.display = 'none';
    });

    // Submit de Registro
    el.formRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nickname = el.inputNickname.value.trim();
      const moto = el.inputMoto.value.trim();
      const cilindraje = el.inputCilindraje.value;

      if (!nickname || !moto || !cilindraje) {
        LoginView.mostrarError('registro', '⚠️ Completa todos los campos');
        return;
      }

      try {
        // Verificar que el nickname no exista ya (consulta a db.json via API)
        const existe = await UserModel.buscarPorNickname(nickname);
        if (existe) {
          LoginView.mostrarError('registro', '⚠️ Ese nickname ya está en uso. Usa otro o accede con él.');
          return;
        }

        // Registrar en la base de datos db.json y logear
        const nuevoUsuario = await UserModel.registrarUsuario(nickname, moto, cilindraje);
        UserModel.iniciarSesion(nuevoUsuario);
        LoginView.cerrarModal();
        this.iniciarApp(nuevoUsuario);
      } catch (error) {
        LoginView.mostrarError('registro', '❌ Error al registrar: ' + error.message);
      }
    });

    // Submit de Acceso (buscar por nickname en db.json)
    el.formAcceso.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nickname = el.inputNicknameAcceso.value.trim();

      if (!nickname) {
        LoginView.mostrarError('acceso', '⚠️ Ingresa tu nickname');
        return;
      }

      try {
        const usuario = await UserModel.buscarPorNickname(nickname);
        if (!usuario) {
          LoginView.mostrarError('acceso', '❌ Nickname no encontrado. ¿Quieres registrarte?');
          return;
        }

        // Login exitoso — guardar sesión local y mostrar la app
        UserModel.iniciarSesion(usuario);
        LoginView.cerrarModal();
        this.iniciarApp(usuario);
      } catch (error) {
        LoginView.mostrarError('acceso', '❌ Error de conexión con el servidor');
      }
    });
  },

  /**
   * Enlazar el evento de cerrar sesión del badge
   */
  bindLogoutEvent() {
    const btnLogout = document.getElementById('btn-cerrar-sesion');
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar que el header haga scroll
        if (confirm('¿Deseas cerrar tu sesión?')) {
          UserModel.cerrarSesion();
          LoginView.ocultarNicknameBadge();
          this.mostrarLogin();
        }
      });
    }
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
    document.addEventListener('click', async (e) => {
      // Si se hizo click a Like en Revista (sigue siendo LocalStorage)
      if (e.target.matches('.btn-like-moto')) {
        const contenedorId = e.target.getAttribute('data-contenedor');
        const index = e.target.getAttribute('data-index');
        const key = contenedorId + index;
        
        const nuevosLikes = MotoModel.addLike(key);
        RevistaView.updateLikesText(contenedorId, index, nuevosLikes);
      }
      
      // Si se hizo click a Like en el Foro (NUEVO: API + ID)
      if (e.target.matches('.btn-like-foro')) {
        const postId = e.target.getAttribute('data-id');
        try {
          const updatedPost = await ForoModel.darLike(postId);
          // Actualizar solo el texto del like en el DOM para mayor fluidez
          const likeEl = document.getElementById(`likes-${postId}`);
          if (likeEl) likeEl.innerText = `${updatedPost.likes} likes`;
        } catch (err) {
          alert("Error al dar like: " + err.message);
        }
      }

      // Si se hizo click a Eliminar en el Foro (NUEVO: API + ID)
      if (e.target.closest('.btn-delete-foro-icon')) {
        const btn = e.target.closest('.btn-delete-foro-icon');
        const postId = btn.getAttribute('data-id');
        if (confirm('¿Estás seguro de que deseas eliminar este registro compartido de la comunidad?')) {
          try {
            await ForoModel.eliminarPublicacion(postId);
            await ForoView.renderPublicaciones(); // Refrescamos vista completa
          } catch (err) {
            alert("No se pudo eliminar: " + err.message);
          }
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

  async publicarMoto() {
    const archivo = ForoView.elements.fileInput.files[0];
    const comentario = ForoView.elements.comentarioInput.value;

    if ((!archivo && !this.fotoCapturada) || comentario === "") {
      alert("Sube una imagen o toma una foto y escribe las características de la moto.");
      return;
    }

    // Agregar el nickname del usuario al comentario del foro
    const sesion = UserModel.obtenerSesion();
    const nicknameTag = sesion ? `[${sesion.nickname}] ` : '';

    try {
        if (this.fotoCapturada) {
          await ForoModel.agregarPublicacion(this.fotoCapturada, nicknameTag + comentario);
          await this.limpiarTrasPublicar();
        } else if (archivo) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            await ForoModel.agregarPublicacion(e.target.result, nicknameTag + comentario);
            await this.limpiarTrasPublicar();
          };
          reader.readAsDataURL(archivo);
        }
    } catch (err) {
        alert("Error al publicar: " + err.message);
    }
  },

  async limpiarTrasPublicar() {
    this.fotoCapturada = null;
    ForoView.limpiarFormulario();
    await ForoView.renderPublicaciones();
  }
};
