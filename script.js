document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
     MENÚ RESPONSIVO
  ===================================================== */

  const menuButton = document.getElementById("menuButton");
  const menu = document.getElementById("menu");

  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const menuActivo = menu.classList.toggle("active");

      menuButton.classList.toggle("active", menuActivo);
      menuButton.setAttribute(
        "aria-expanded",
        menuActivo ? "true" : "false"
      );
    });

    menu.querySelectorAll("a").forEach((enlace) => {
      enlace.addEventListener("click", () => {
        menu.classList.remove("active");
        menuButton.classList.remove("active");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }


  /* =====================================================
     VIDEOS DE YOUTUBE
  ===================================================== */

  /*
    Agrega o elimina enlaces en este arreglo.

    Formatos aceptados:

    https://www.youtube.com/watch?v=VIDEO_ID
    https://youtu.be/VIDEO_ID
    https://www.youtube.com/shorts/VIDEO_ID
    https://www.youtube.com/embed/VIDEO_ID
  */

  const youtubeVideos = [
    "https://www.youtube.com/watch?v=fI2aZyh4KNc",
    "https://www.youtube.com/watch?v=lGUccLBC80Y",
    "https://www.youtube.com/watch?v=M078GNaisas",
    "https://www.youtube.com/watch?v=YJPpy-wNBpA"
  ];

  const youtubeTrack =
    document.getElementById("youtube-track");

  const youtubeIndicators =
    document.getElementById("youtube-indicators");

  const youtubePrev =
    document.getElementById("youtube-prev");

  const youtubeNext =
    document.getElementById("youtube-next");

  const youtubeCarousel =
    document.getElementById("youtube-carousel");

  let youtubeCurrentIndex = 0;


  /* =====================================================
     EXTRAER EL ID DE YOUTUBE
  ===================================================== */

  function getYoutubeId(url) {
    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.hostname.includes("youtu.be")) {
        return parsedUrl.pathname
          .split("/")
          .filter(Boolean)[0] || null;
      }

      if (parsedUrl.pathname.includes("/shorts/")) {
        return parsedUrl.pathname
          .split("/shorts/")[1]
          .split("/")[0] || null;
      }

      if (parsedUrl.pathname.includes("/embed/")) {
        return parsedUrl.pathname
          .split("/embed/")[1]
          .split("/")[0] || null;
      }

      return parsedUrl.searchParams.get("v");
    } catch (error) {
      console.error(
        "Enlace de YouTube inválido:",
        url,
        error
      );

      return null;
    }
  }


  /* =====================================================
     CONSTRUIR URL DEL REPRODUCTOR
  ===================================================== */

  function createYoutubeEmbedUrl(videoId) {
    const embedUrl = new URL(
      `https://www.youtube.com/embed/${videoId}`
    );

    embedUrl.searchParams.set("rel", "0");
    embedUrl.searchParams.set("modestbranding", "1");
    embedUrl.searchParams.set("playsinline", "1");

    /*
      Solo se agrega origin cuando la página se ejecuta desde:

      http://
      https://

      Al abrir index.html con doble clic, el origen es "null".
    */

    if (
      window.location.protocol === "http:" ||
      window.location.protocol === "https:"
    ) {
      embedUrl.searchParams.set(
        "origin",
        window.location.origin
      );
    }

    return embedUrl.toString();
  }


  /* =====================================================
     DETENER VIDEOS NO VISIBLES
  ===================================================== */

  function stopHiddenYoutubeVideos() {
    if (!youtubeTrack) {
      return;
    }

    const slides =
      youtubeTrack.querySelectorAll(".youtube-slide");

    slides.forEach((slide, slideIndex) => {
      if (slideIndex === youtubeCurrentIndex) {
        return;
      }

      const iframe = slide.querySelector("iframe");

      if (!iframe) {
        return;
      }

      /*
        Recargar el iframe detiene el video que estaba sonando.
      */

      const iframeSource = iframe.getAttribute("src");

      iframe.setAttribute("src", "");
      iframe.setAttribute("src", iframeSource);
    });
  }


  /* =====================================================
     MOSTRAR UN VIDEO DEL CARRUSEL
  ===================================================== */

  function showYoutubeSlide(index) {
    if (!youtubeTrack) {
      return;
    }

    const slides =
      youtubeTrack.querySelectorAll(".youtube-slide");

    const indicators =
      youtubeIndicators
        ? youtubeIndicators.querySelectorAll(
            ".youtube-indicator"
          )
        : [];

    if (slides.length === 0) {
      return;
    }

    if (index >= slides.length) {
      youtubeCurrentIndex = 0;
    } else if (index < 0) {
      youtubeCurrentIndex = slides.length - 1;
    } else {
      youtubeCurrentIndex = index;
    }

    youtubeTrack.style.transform =
      `translateX(-${youtubeCurrentIndex * 100}%)`;

    indicators.forEach((indicator, indicatorIndex) => {
      const indicadorActivo =
        indicatorIndex === youtubeCurrentIndex;

      indicator.classList.toggle(
        "active",
        indicadorActivo
      );

      indicator.setAttribute(
        "aria-current",
        indicadorActivo ? "true" : "false"
      );
    });

    stopHiddenYoutubeVideos();
  }


  /* =====================================================
     CREAR EL CARRUSEL
  ===================================================== */

  function createYoutubeCarousel() {
    if (!youtubeTrack || !youtubeIndicators) {
      return;
    }

    youtubeTrack.innerHTML = "";
    youtubeIndicators.innerHTML = "";

    const validVideos = youtubeVideos
      .map((url) => ({
        url,
        id: getYoutubeId(url)
      }))
      .filter((video) => video.id);

    if (validVideos.length === 0) {
      youtubeTrack.innerHTML = `
        <div class="youtube-empty">
          Agrega al menos un enlace válido de YouTube
          dentro de script.js.
        </div>
      `;

      if (youtubePrev) {
        youtubePrev.hidden = true;
      }

      if (youtubeNext) {
        youtubeNext.hidden = true;
      }

      return;
    }

    if (youtubePrev) {
      youtubePrev.hidden = validVideos.length <= 1;
    }

    if (youtubeNext) {
      youtubeNext.hidden = validVideos.length <= 1;
    }

    validVideos.forEach((video, index) => {
      const slide = document.createElement("article");

      slide.className = "youtube-slide";

      const embedUrl =
        createYoutubeEmbedUrl(video.id);

      slide.innerHTML = `
        <div class="youtube-video-wrapper">
          <iframe
            src="${embedUrl}"
            title="Pelea LAP Fight League ${index + 1}"
            loading="lazy"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
              web-share
            "
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>

        <div class="youtube-video-info">
          <div>
            <span class="youtube-video-number">
              Pelea ${String(index + 1).padStart(2, "0")}
            </span>

            <h3>
              Combate oficial de LAP Fight League
            </h3>
          </div>

          <a
            class="youtube-open-link"
            href="${video.url}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver en YouTube
          </a>
        </div>
      `;

      youtubeTrack.appendChild(slide);

      const indicator =
        document.createElement("button");

      indicator.type = "button";
      indicator.className = "youtube-indicator";

      indicator.setAttribute(
        "aria-label",
        `Mostrar pelea ${index + 1}`
      );

      indicator.setAttribute(
        "aria-current",
        index === 0 ? "true" : "false"
      );

      if (index === 0) {
        indicator.classList.add("active");
      }

      indicator.addEventListener("click", () => {
        showYoutubeSlide(index);
      });

      youtubeIndicators.appendChild(indicator);
    });

    showYoutubeSlide(0);
  }


  /* =====================================================
     BOTONES ANTERIOR Y SIGUIENTE
  ===================================================== */

  if (youtubePrev) {
    youtubePrev.addEventListener("click", () => {
      showYoutubeSlide(youtubeCurrentIndex - 1);
    });
  }

  if (youtubeNext) {
    youtubeNext.addEventListener("click", () => {
      showYoutubeSlide(youtubeCurrentIndex + 1);
    });
  }


  /* =====================================================
     NAVEGACIÓN CON TECLADO
  ===================================================== */

  document.addEventListener("keydown", (event) => {
    if (!youtubeCarousel) {
      return;
    }

    /*
      Solo cambia el carrusel cuando este tiene el foco
      o alguno de sus elementos internos está seleccionado.
    */

    const carouselFocused =
      youtubeCarousel.contains(document.activeElement) ||
      document.activeElement === document.body;

    if (!carouselFocused) {
      return;
    }

    if (event.key === "ArrowLeft") {
      showYoutubeSlide(youtubeCurrentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      showYoutubeSlide(youtubeCurrentIndex + 1);
    }
  });


  /* =====================================================
     ADVERTENCIA AL ABRIR EL HTML DIRECTAMENTE
  ===================================================== */

  if (window.location.protocol === "file:") {
    console.warn(
      "El sitio se está ejecutando como archivo local. " +
      "YouTube puede mostrar el Error 153. " +
      "Abre el proyecto con Live Server, localhost " +
      "o desde GitHub Pages."
    );
  }


  /* =====================================================
     INICIAR CARRUSEL
  ===================================================== */

  createYoutubeCarousel();
});
