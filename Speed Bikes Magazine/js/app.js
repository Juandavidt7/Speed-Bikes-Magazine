import { AppController } from './controllers/AppController.js';

// Punto de entrada absoluto de la aplicación.
// Los módulos type="module" se difieren automáticamente. Protegemos la inicialización.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    AppController.init();
  });
} else {
  AppController.init();
}
