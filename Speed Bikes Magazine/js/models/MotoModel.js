export const MotoModel = {
  nuevas: [
    {
      titulo: "Yamaha R1 2026",
      descripcion: "La Yamaha R1 es una de las motocicletas deportivas más emblemáticas...",
      imagen: "img/R1.png"
    },
    {
      titulo: "Kawasaki Ninja 2026",
      descripcion: "La línea Ninja de Kawasaki nació en los años 80, marcando un antes y un después...",
      imagen: "img/NINJA.png"
    }
  ],
  clasicas: [
    {
      titulo: "Harley Davidson 1970",
      descripcion: "Harley-Davidson, fundada en 1903, es una de las marcas más icónicas...",
      imagen: "https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg"
    },
    {
      titulo: "Honda CB750",
      descripcion: "Lanzada en 1969, la Honda CB750 es considerada la primera superbike moderna...",
      imagen: "img/CB750.png"
    }
  ],
  famosas: [
    {
      titulo: "Moto de película",
      descripcion: "A lo largo de la historia del cine, las motocicletas han sido protagonistas...",
      imagen: "https://images.pexels.com/photos/2611690/pexels-photo-2611690.jpeg"
    },
    {
      titulo: "Moto de carreras",
      descripcion: "Las motos de carreras representan la máxima expresión de velocidad...",
      imagen: "https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg"
    }
  ],

  getLikes(key) {
    return parseInt(localStorage.getItem(key)) || 0;
  },

  addLike(key) {
    let likes = this.getLikes(key);
    likes++;
    localStorage.setItem(key, likes);
    return likes;
  }
};
