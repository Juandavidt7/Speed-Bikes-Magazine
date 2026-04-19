export const NavView = {
  // SPA Screen Changer
  cambiarPantalla(pantallaId, btnElement) {
    // Ocultar todas las pantallas
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
      screen.classList.remove('active');
    });

    // Mostrar la pantalla seleccionada
    const targetScreen = document.getElementById(pantallaId);
    if(targetScreen) {
        targetScreen.classList.add('active');
    }

    // Hacer scroll al principio siempre que se presione Revista
    if (pantallaId === 'pantalla-inicio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Actualizar estado de los botones de la barra inferior
    const botones = document.querySelectorAll('.nav-btn');
    botones.forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Marcar el botón como activo si se pasó la referencia
    if (btnElement) {
      btnElement.classList.add('active');
    }
  },

  // Control Visual del Dropdown Custom
  cerrarDropdown() {
    const dropdown = document.querySelector('.dropdown-categorias');
    if (dropdown) {
      dropdown.removeAttribute('open');
    }
  },

  // Flujo compuesto: cambia vista PWA y enfoca la sección contacto internamente
  irAContacto() {
    const botones = document.querySelectorAll('.nav-btn');
    // Forzar pantalla 1 pero encender botón 3 ("Contacto")
    this.cambiarPantalla('pantalla-inicio', botones[2]); 
    
    setTimeout(() => {
      const sectionContacto = document.getElementById('contacto');
      if (sectionContacto) {
        sectionContacto.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  }
};
