/**
 * LoginView.js
 * Vista encargada del modal de login/registro y del badge de nickname.
 * Maneja tanto el formulario de registro como el de acceso por nickname.
 */
export const LoginView = {

  /**
   * Renderizar el overlay modal de login en el DOM
   */
  renderModal() {
    // Evitar duplicados si ya existe
    if (document.getElementById('login-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'login-overlay';
    overlay.innerHTML = `
      <div class="login-modal" id="login-modal">
        <div class="login-header">
          <span class="login-logo">🏍</span>
          <h2>Bienvenido a Speed Bikes</h2>
          <p class="login-subtitle">Únete a la comunidad motera</p>
        </div>

        <!-- TABS para alternar entre Registro y Acceso -->
        <div class="login-tabs">
          <button class="login-tab active" id="tab-registro" type="button">Nuevo Rider</button>
          <button class="login-tab" id="tab-acceso" type="button">Ya tengo cuenta</button>
        </div>

        <!-- FORMULARIO DE REGISTRO -->
        <form class="login-form" id="form-registro">
          <div class="input-group">
            <label for="input-nickname">👤 Nickname</label>
            <input type="text" id="input-nickname" placeholder="Tu apodo de rider..." required maxlength="20" autocomplete="off">
          </div>
          <div class="input-group">
            <label for="input-moto">🏍️ Moto Favorita</label>
            <input type="text" id="input-moto" placeholder="Ej: Yamaha R1, Kawasaki Ninja..." required maxlength="40" autocomplete="off">
          </div>
          <div class="input-group">
            <label for="input-cilindraje">⚙️ Cilindraje Preferido</label>
            <select id="input-cilindraje" required>
              <option value="" disabled selected>Selecciona un cilindraje</option>
              <option value="125cc">125cc - Urbana</option>
              <option value="250cc">250cc - Starter</option>
              <option value="400cc">400cc - Intermedia</option>
              <option value="600cc">600cc - Sport</option>
              <option value="750cc">750cc - Superbike</option>
              <option value="1000cc">1000cc - Litre Bike</option>
              <option value="1000cc+">1000cc+ - Bestia</option>
            </select>
          </div>
          <button type="submit" class="btn-login" id="btn-registrarse">
            <span>🚀 Registrarse y Entrar</span>
          </button>
          <p class="login-error" id="error-registro"></p>
        </form>

        <!-- FORMULARIO DE ACCESO (buscar por nickname) -->
        <form class="login-form" id="form-acceso" style="display: none;">
          <div class="input-group">
            <label for="input-nickname-acceso">👤 Tu Nickname</label>
            <input type="text" id="input-nickname-acceso" placeholder="Ingresa tu nickname..." required maxlength="20" autocomplete="off">
          </div>
          <button type="submit" class="btn-login" id="btn-acceder">
            <span>🔓 Acceder</span>
          </button>
          <p class="login-error" id="error-acceso"></p>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
  },

  /**
   * Mostrar el badge del nickname en el header
   * @param {object} usuario - Objeto del usuario con nickname, motoFavorita, etc.
   */
  mostrarNicknameBadge(usuario) {
    // Limpiar badge anterior si existe
    const existente = document.getElementById('nickname-badge');
    if (existente) existente.remove();

    const badge = document.createElement('div');
    badge.id = 'nickname-badge';
    badge.innerHTML = `
      <div class="badge-info">
        <span class="badge-avatar">🏍</span>
        <span class="badge-name">${usuario.nickname}</span>
      </div>
      <button class="badge-logout" id="btn-cerrar-sesion" title="Cerrar sesión">✕</button>
    `;

    // Insertar el badge dentro del header existente
    const header = document.querySelector('.app-header');
    if (header) {
      header.appendChild(badge);
    }
  },

  /**
   * Ocultar y remover completamente el modal del DOM
   */
  cerrarModal() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) {
      overlay.classList.add('closing');
      setTimeout(() => {
        overlay.remove();
      }, 400);
    }
  },

  /**
   * Remover el badge del nickname (al cerrar sesión)
   */
  ocultarNicknameBadge() {
    const badge = document.getElementById('nickname-badge');
    if (badge) badge.remove();
  },

  /**
   * Mostrar mensaje de error en el formulario indicado
   */
  mostrarError(formType, mensaje) {
    const errorEl = document.getElementById(`error-${formType}`);
    if (errorEl) {
      errorEl.textContent = mensaje;
      errorEl.style.display = 'block';
      setTimeout(() => {
        errorEl.style.display = 'none';
      }, 4000);
    }
  },

  /**
   * Referencias rápidas a los elementos del modal
   */
  get elements() {
    return {
      overlay: document.getElementById('login-overlay'),
      tabRegistro: document.getElementById('tab-registro'),
      tabAcceso: document.getElementById('tab-acceso'),
      formRegistro: document.getElementById('form-registro'),
      formAcceso: document.getElementById('form-acceso'),
      inputNickname: document.getElementById('input-nickname'),
      inputMoto: document.getElementById('input-moto'),
      inputCilindraje: document.getElementById('input-cilindraje'),
      inputNicknameAcceso: document.getElementById('input-nickname-acceso'),
      btnCerrarSesion: document.getElementById('btn-cerrar-sesion')
    };
  }
};
