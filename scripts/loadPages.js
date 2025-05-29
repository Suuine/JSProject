document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (localStorage.getItem("username")) {
    let name = localStorage.getItem("username");
    document.getElementById("name").innerHTML = `Привіт, ${name}!`;
    if (document.getElementById("register")) {
      document.getElementById("register").remove();
    }
  }

  const burgerMenu = document.querySelector(".burger-menu");
  const nav = document.querySelector("#nav");

  burgerMenu.addEventListener("click", () => {
    nav.classList.toggle("active");
  });

  showCategory("catalogs/manga.json", "manga-list");
  showCategory("catalogs/manhwa.json", "manhwa-list");
  showCategory("catalogs/manhua.json", "manhua-list");
  showCategory("catalogs/novel.json", "novel-list");
  showCategory("catalogs/ranobe.json", "ranobe-list");
});
const showCategory = (jsonName, nameOfPlace) => {
  let cachedData = null;

  const renderMangaList = () => {
    const mangaList = document.getElementById(nameOfPlace);
    mangaList.innerHTML = "";

    cachedData.forEach((manga) => {
      const mangaItem = document.createElement("div");
      mangaItem.className = "manga-item";
      mangaItem.innerHTML = `
        <img src="${manga.cover}" alt="${manga.name}">
        <h3>${manga.name.slice(0, 40)}</h3>
      `;

      if (window.innerWidth < 750) {
        mangaItem.style.cursor = "pointer";
        mangaItem.addEventListener("click", () => {
          showDetails(jsonName, cachedData.indexOf(manga));
        });
      } else {
        let overlay = null;
        let hideTimeout = null;

        const showOverlay = () => {
          if (overlay && document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }

          overlay = document.createElement("div");
          overlay.className = "overlay";

          const mangaDetails = document.createElement("div");
          mangaDetails.className = "manga-details";
          mangaDetails.innerHTML = `
            <div class="text-content1">
              <img src="${manga.cover}" alt="${manga.name}">
              <button id="details">Read More</button>
            </div>
            <div class="text-content">
              <h2>${manga.name}</h2>
              <p>${manga.description.slice(0, 100) + "..."}</p>
              <p><strong>Author:</strong> ${manga.author}</p>
              <p><strong>Genres:</strong> ${manga.genres.join(", ")}</p>
              <p><strong>Rating:</strong> ${"★".repeat(
                Math.round(manga.rating)
              )} (${manga.rating}/10)</p>
            </div>
          `;

          mangaDetails
            .querySelector("#details")
            .addEventListener("click", () => {
              showDetails(jsonName, cachedData.indexOf(manga));
              if (overlay && document.body.contains(overlay)) {
                document.body.removeChild(overlay);
                overlay = null;
              }
            });

          overlay.appendChild(mangaDetails);
          document.body.appendChild(overlay);

          const rect = mangaItem.getBoundingClientRect();
          const overlayWidth = 540;
          const spaceRight = window.innerWidth - rect.right;
          const spaceLeft = rect.left;

          let left, top;
          top = rect.top + window.scrollY - 30;
          if (spaceRight > overlayWidth + 20) {
            left = rect.right + 10 + window.scrollX;
          } else if (spaceLeft > overlayWidth + 20) {
            left = rect.left - overlayWidth - 10 + window.scrollX;
          } else {
            left = rect.left + window.scrollX;
            top = rect.bottom + 10 + window.scrollY;
          }

          overlay.style.left = `${left}px`;
          overlay.style.top = `${top}px`;

          overlay.addEventListener("mouseenter", () => {
            if (hideTimeout) clearTimeout(hideTimeout);
          });

          overlay.addEventListener("mouseleave", () => {
            hideTimeout = setTimeout(() => {
              if (overlay && document.body.contains(overlay)) {
                document.body.removeChild(overlay);
                overlay = null;
              }
            }, 100);
          });
        };

        mangaItem.addEventListener("mouseenter", () => {
          if (hideTimeout) clearTimeout(hideTimeout);
          showOverlay();
        });

        mangaItem.addEventListener("mouseleave", () => {
          if (overlay) {
            hideTimeout = setTimeout(() => {
              if (overlay && document.body.contains(overlay)) {
                document.body.removeChild(overlay);
                overlay = null;
              }
            }, 100);
          }
        });
      }

      mangaList.appendChild(mangaItem);
    });
  };

  fetch(jsonName)
    .then((response) => response.json())
    .then((data) => {
      cachedData = data;
      renderMangaList();

      window.addEventListener("resize", () => {
        renderMangaList();
      });
    })
    .catch((error) => {
      console.error("Error fetching manga data:", error);
    });
};

const showDetails = (jsonName, index) => {
  window.scrollTo({ top: 0, behavior: "smooth" });

  document.getElementById("content").innerHTML = "";
  document.getElementById("about").innerHTML = "";

  fetch(jsonName)
    .then((response) => response.json())
    .then((data) => {
      const manga = data[index];

      document.getElementById("content").innerHTML = `

        <div class="product-page">
        <a href="index.html" class="back-button"><</a>
          <div class="breadcrumbs">           
            <a href="index.html">Головна</a> / ${manga.name}
          </div>
          
          <div class="product-main">
            <div class="product-gallery">
              <img src="${manga.cover}" alt="${manga.name}" class="main-image">
            </div>
            
            <div class="product-info">
              <h1 class="product-title">${manga.name}</h1>
              
              <div class="product-price">${manga.price} грн</div>
              
              <div class="product-meta">
                <div class="meta-item">
                  <strong>Автор:</strong>
                  <span>${manga.author}</span>
                </div>
                <div class="meta-item">
                  <strong>Видавництво:</strong>
                  <span>${manga.publisher}</span>
                </div>
                <div class="meta-item">
                  <strong>Жанр:</strong>
                  <span>${manga.genres.join(", ")}</span>
                </div>
                <div class="meta-item">
                  <strong>Сторінок:</strong>
                  <span>${manga.pages}</span>
                </div>
                <div class="meta-item">
                  <strong>Рейтинг:</strong>
                  <span>${"★".repeat(Math.round(manga.rating))} (${
        manga.rating
      }/5)</span>
                </div>
              </div>
              
              <div class="action-buttons">
                <button class="btn btn-primary">Додати до кошика</button>
                <button class="btn btn-secondary">Список бажань</button>
              </div>
            </div>
          </div>
          
          <div class="product-description">
            <h2>Опис</h2>
            <p>${manga.description}</p>
          </div>
          
          <h2>Схожі товари</h2>
          <div class="recommendations">           
            <div id="similar-products" class="manga-list"></div>
          </div>
        </div>
        <
      `;

      showByGanre(manga.genres[1] || manga.genres[0]);
    })
    .catch((error) => {
      console.error("Error fetching product details:", error);
    });
};

const showByGanre = (genre) => {
  const recommendations = document.getElementById("similar-products");
  recommendations.innerHTML = "";

  const catalogs = [
    "catalogs/manga.json",
    "catalogs/manhwa.json",
    "catalogs/manhua.json",
    "catalogs/novel.json",
    "catalogs/ranobe.json",
  ];
  let found = false;

  Promise.all(
    catalogs.map((catalog) =>
      fetch(catalog)
        .then((response) => response.json())
        .then((data) => {
          const filteredManga = data
            .map((manga, idx) => ({ ...manga, _index: idx, _catalog: catalog }))
            .filter((manga) => manga.genres.includes(genre));
          filteredManga.forEach((manga) => {
            found = true;
            const mangaItem = document.createElement("div");
            mangaItem.className = "manga-item";
            mangaItem.innerHTML = `
              <img src="${manga.cover}" alt="${manga.name}">
              <h3>${manga.name.slice(0, 20)}</h3>
            `;
            mangaItem.addEventListener("click", () => {
              showDetails(manga._catalog, manga._index);
            });
            recommendations.appendChild(mangaItem);
          });
        })
    )
  ).then(() => {
    if (!found) {
      recommendations.innerHTML = "<p>Нічого не знайдено.</p>";
    }
  });
};

const showCatalogs = (nameCatalog) => {
  window.scrollTo({ top: 0, behavior: "smooth" });

  document.getElementById("content").innerHTML = "";
  document.getElementById("about").innerHTML = "";
  let name = nameCatalog;
  document.getElementById("content").innerHTML = `
    <p>${name.slice(0, 1).toUpperCase() + name.slice(1)}</p>
    <div id = "${nameCatalog}-list"></div>
  `;

  showCategory(`catalogs/${nameCatalog}.json`, `${nameCatalog}-list`);
};

const registerUser = () => {
  const registerForm = document.createElement("div");
  registerForm.innerHTML = `
    <form class = "register-form">
      <label for="username">Ім'я користувача:</label>
      <input type="text" id="username" name="username" required>
      <button type="submit">Зареєструватися</button>
    </form>
  `;
  document.body.appendChild(registerForm);

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    localStorage.setItem("username", username);

    const notification = document.createElement("div");
    notification.textContent = "Ви успішно верифікувались";
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.right = "20px";
    notification.style.backgroundColor = "#4CAF50";
    notification.style.color = "white";
    notification.style.padding = "10px";
    notification.style.borderRadius = "5px";
    notification.style.zIndex = "1000";
    document.body.appendChild(notification);

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);

    document.body.removeChild(registerForm);
    let name = localStorage.getItem("username");
    document.getElementById("name").innerHTML = `Привіт, ${name}!`;
    document.getElementById("register").remove();
  });
};

const ShowBlog = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });

  document.getElementById("about").innerHTML = "";
  document.getElementById("hero").innerHTML = "";
  document.getElementById("hero").style.display = "none";
  document.getElementById("content").innerHTML = "";
  if (!document.getElementById("content").innerHTML) {
    const content = document.createElement("div");
    content.id = "content";
    document.body.appendChild(content);
  }
  document.getElementById("content").innerHTML = `
    <p>Блог</p>
    <div id = "blog-list"></div>
  `;
  showPosts("catalogs/blog.json", "blog-list");
};

function showPosts(url, elementId) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const blogList = document.getElementById(elementId);
      blogList.innerHTML = "";

      data.forEach((post, index) => {
        const postElement = document.createElement("article");
        postElement.className = "blog-post";
        postElement.innerHTML = `
                    ${
                      post.image
                        ? `<img src="${post.image}" alt="${post.name}">`
                        : ""
                    }
                    <h2>${post.name}</h2>
                    <span class="date">${post.date}</span>
                    <div class="content">${post.content}</div>
                `;
        blogList.appendChild(postElement);
      });
    });
}

function aboutSite() {
  window.scrollTo({ top: 0, behavior: "smooth" });

  document.getElementById("about").innerHTML = "";
  document.getElementById("hero").innerHTML = "";
  document.getElementById("hero").style.display = "none";
  document.getElementById("content").innerHTML = "";
  document.getElementById("about").innerHTML = `
    <div class="about-page">
    <section class="about-hero">
        <h1>Про AsiSeaker</h1>
        <p>Ваш провідник у світ азійської літератури та коміксів</p>
    </section>

    <section class="about-content">
        <div class="about-card">
            <h2><i class="fas fa-book-open"></i> Наша місія</h2>
            <p>Ми створюємо простір для любителів азійської культури, де кожен може знайти цікаві твори, дізнатися про новинки та поділитися своїми враженнями.</p>
        </div>

        <div class="about-card">
            <h2><i class="fas fa-users"></i> Наша команда</h2>
            <p>Ми - група ентузіастів, які об'єднали любов до манґи, манхви, ранобе та азійської літератури. Наша команда постійно працює над покращенням платформи.</p>
        </div>

        <div class="about-card">
            <h2><i class="fas fa-star"></i> Наші цінності</h2>
            <ul>
                <li>Доступність контенту</li>
                <li>Якісні переклади</li>
                <li>Спільнота однодумців</li>
                <li>Повага до авторських прав</li>
            </ul>
        </div>
    </section>

    <section class="about-history">
        <h2>Наша історія</h2>
        <div class="timeline">
            <div class="timeline-item">
                <div class="timeline-date">1</div>
                <div class="timeline-content">
                    <h3>Ідея</h3>
                    <p>Ідея створення платформи з'явилася як невеликий проект для друзів.</p>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-date">2</div>
                <div class="timeline-content">
                    <h3>Пропрацювання проекту</h3>
                    <p>Було обговорено, які функції потрібно додати і як їх реалізувати.</p>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-date">3</div>
                <div class="timeline-content">
                    <h3>Дизайн</h3>
                    <p>Повний дизайн платформи покращувався з кожним разом.</p>
                </div>
            </div>
        </div>
    </section>
</div>
`;
}
