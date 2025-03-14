document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();

  document
    .getElementById("cancel-edit")
    .addEventListener("click", closeEditModal);

  document
    .getElementById("add-product")
    .addEventListener("click", openNewProductModal);
  document
    .getElementById("cancel-new")
    .addEventListener("click", closeNewProductModal);

  document.getElementById("save-new").addEventListener("click", saveNewProduct);
});

const productsPerPage = 12;
let currentPage = 1;

function fetchProducts() {
  let products = JSON.parse(localStorage.getItem("products"))?.products || [];

  if (products.length === 0) {
    fetch("products.json")
      .then((response) => response.json())
      .then((data) => {
        localStorage.setItem("products", JSON.stringify({ products: data }));
        displayProducts(data.filter((p) => p.istaknuto));
      })
      .catch((error) =>
        console.error("Greška pri učitavanju podataka:", error)
      );
  } else {
    displayProducts(products.filter((p) => p.istaknuto));
  }
}

function displayProducts(products) {
  const productList = document.getElementById("product-list");
  const productContainer = document.querySelector(".product-container");

  if (products.length === 0) {
    productList.innerHTML = `<tr><td colspan="6">Nema dostupnih proizvoda.</td></tr>`;
    productContainer.innerHTML = "<p>Nema proizvoda za prikazivanje.</p>";
    return;
  }

  productList.innerHTML = "";
  productContainer.innerHTML = "";

  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginatedProducts = products.slice(start, end);

  paginatedProducts.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.naziv}</td>
      <td>${product.kategorija}</td>
      <td>${product.istaknuto ? "da" : "ne"}</td>
      <td>${product.cijena_2025.toFixed(2)} €</td>
      <td>${
        product.posljednja_izmjena ? product.posljednja_izmjena : "N/A"
      }</td>
      <td>
        <button class="edit-btn" data-id="${product.id}">✏️ Uredi</button>
        <button class="delete-btn" data-id="${product.id}">🗑️ Obriši</button>
      </td>
    `;
    productList.appendChild(row);

    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <h3>${product.naziv}</h3>
      <p><strong>Kategorija:</strong> ${product.kategorija}</p>
      <p><strong>Istaknuto:</strong> ${product.istaknuto ? "da" : "ne"}</p>
      <p><strong>Cijena:</strong> ${product.cijena_2025.toFixed(2)} €</p>
      <p><strong>Posljednja izmjena:</strong> ${
        product.posljednja_izmjena ? product.posljednja_izmjena : "N/A"
      }</p>
      <div class="card-actions">
        <button class="edit-btn" data-id="${product.id}">✏️ Uredi</button>
        <button class="delete-btn" data-id="${product.id}">🗑️ Obriši</button>
      </div>
    `;
    productContainer.appendChild(card);
  });

  prikaziPaginaciju(products);
  addEventListeners(products);
  updateDisplayMode();
}

function updateDisplayMode() {
  const table = document.getElementById("product-table");
  const productContainer = document.querySelector(".product-container");

  if (window.innerWidth <= 768) {
    table.style.display = "none";
    productContainer.style.display = "grid";
  } else {
    table.style.display = "table";
    productContainer.style.display = "none";
  }
}

window.addEventListener("resize", updateDisplayMode);
window.addEventListener("DOMContentLoaded", updateDisplayMode);

function prikaziPaginaciju(products) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(products.length / productsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.add("page-btn");
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentPage = i;
      displayProducts(products);
    });

    pagination.appendChild(btn);
  }
}

function addEventListeners(products) {
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.removeEventListener("click", handleEditClick);
    button.addEventListener("click", handleEditClick);
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.removeEventListener("click", handleDeleteClick);
    button.addEventListener("click", handleDeleteClick);
  });

  function handleEditClick(event) {
    const productId = event.target.getAttribute("data-id");
    const product = products.find((p) => p.id == productId);
    openEditModal(product);
  }

  function handleDeleteClick(event) {
    const productId = event.target.getAttribute("data-id");
    deleteProduct(productId);
  }
}

function openEditModal(product) {
  if (!product) {
    console.error("Proizvod nije pronađen!");
    return;
  }

  const modal = document.getElementById("edit-modal");
  document.getElementById("edit-name").value = product.naziv;
  document.getElementById("edit-category").value = product.kategorija;
  document.getElementById("edit-price").value = product.cijena_2025;

  modal.style.display = "block";

  const saveButton = document.getElementById("save-edit");
  saveButton.removeEventListener("click", saveProductChanges);
  saveButton.addEventListener("click", function () {
    saveProductChanges(product.id);
  });
}

function saveProductChanges(productId) {
  let products = JSON.parse(localStorage.getItem("products")) || [];
  let product = products.find((p) => p.id == productId);

  if (!product) {
    console.error("Proizvod nije pronađen!");
    return;
  }

  product.naziv = document.getElementById("edit-name").value;
  product.kategorija = document.getElementById("edit-category").value;
  product.cijena_2025 = parseFloat(document.getElementById("edit-price").value);
  product.posljednja_izmjena = new Date().toLocaleString("hr-HR");
  product.istaknuto = document.getElementById("edit-highlighted").checked;

  localStorage.setItem("products", JSON.stringify(products));

  closeEditModal();
  displayProducts(products);
}

function closeEditModal() {
  document.getElementById("edit-modal").style.display = "none";
}

function deleteProduct(id) {
  let products = JSON.parse(localStorage.getItem("products")) || [];

  if (confirm("Jeste li sigurni da želite obrisati proizvod?")) {
    products = products.filter((p) => p.id != Number(id));
    localStorage.setItem("products", JSON.stringify(products));
    displayProducts(products);
  }
}

function openNewProductModal() {
  document.getElementById("new-product-modal").style.display = "block";
}

function closeNewProductModal() {
  document.getElementById("new-product-modal").style.display = "none";
  document.getElementById("new-name").value = "";
  document.getElementById("new-category").value = "Potrepštine";
  document.getElementById("new-price-2024").value = "";
  document.getElementById("new-price-2025").value = "";
  document.getElementById("new-highlighted").checked = false;
}

function saveNewProduct() {
  let products = JSON.parse(localStorage.getItem("products")) || [];

  const newProduct = {
    id: Date.now(),
    naziv: document.getElementById("new-name").value,
    kategorija: document.getElementById("new-category").value,
    cijena_2024:
      parseFloat(document.getElementById("new-price-2024").value) || 0,
    cijena_2025:
      parseFloat(document.getElementById("new-price-2025").value) || 0,
    istaknuto: document.getElementById("new-highlighted").checked,
    posljednja_izmjena: new Date().toLocaleString("hr-HR"),
  };

  products.unshift(newProduct);
  localStorage.setItem("products", JSON.stringify(products));

  closeNewProductModal();
  displayProducts(products);
}

document.getElementById("add-product").addEventListener("click", function () {
  document.getElementById("new-product-modal").style.display = "block";
});

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", function (e) {
    if (e.target === this) {
      this.style.display = "none";
    }
  });
});

// Pretraga proizvoda
document.getElementById("search").addEventListener("input", function (e) {
  let searchTerm = this.value.trim().toLowerCase();
  let products = JSON.parse(localStorage.getItem("products")) || [];

  if (searchTerm === "") {
    displayProducts(products);
    return;
  }

  let foundProducts = products.filter((p) =>
    p.naziv.toLowerCase().startsWith(searchTerm)
  );

  if (foundProducts.length > 0) {
    displayProducts(foundProducts);
  } else {
    const productList = document.getElementById("product-list");
    productList.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 20px; font-size: 18px; font-weight: bold; color: #8b5e3c;">
              Nema traženog proizvoda.
            </td>
          </tr>
        `;
  }
});
