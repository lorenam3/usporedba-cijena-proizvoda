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
  let products = JSON.parse(localStorage.getItem("products")) || [];

  if (products.length === 0) {
    fetch("../products.json")
      .then((response) => response.json())
      .then((data) => {
        localStorage.setItem("products", JSON.stringify(data));
        displayProducts(data);
        addEventListeners(data);
      })
      .catch((error) =>
        console.error("Greška pri dohvaćanju podataka:", error)
      );
  } else {
    displayProducts(products);
    addEventListeners(products);
  }
}

function displayProducts(products) {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

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
                <button class="edit-btn" data-id="${
                  product.id
                }">✏️ Uredi</button>
                <button class="delete-btn" data-id="${
                  product.id
                }">🗑️ Obriši</button>
              </td>
            `;
    productList.appendChild(row);
  });

  prikaziPaginaciju(products);
  addEventListeners(products);
}

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
    button.addEventListener("click", (event) => {
      const productId = event.target.getAttribute("data-id");
      const product = products.find((p) => p.id == productId);
      openEditModal(product);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const productId = event.target.getAttribute("data-id");
      deleteProduct(productId);
    });
  });
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
  saveButton.replaceWith(saveButton.cloneNode(true));
  document.getElementById("save-edit").addEventListener("click", function () {
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

  localStorage.setItem("products", JSON.stringify(products));

  closeEditModal();
  displayProducts(products);
}

function closeEditModal() {
  document.getElementById("edit-modal").style.display = "none";
}

function deleteProduct(id) {
  if (confirm("Jeste li sigurni da želite obrisati proizvod?")) {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products = products.filter((p) => p.id != Number(id));
    localStorage.setItem("products", JSON.stringify(products));
    fetchProducts();
  }
}

function openNewProductModal() {
  document.getElementById("new-product-modal").style.display = "block";
}

function closeNewProductModal() {
  document.getElementById("new-product-modal").style.display = "none";
}

function saveNewProduct() {
  let products = JSON.parse(localStorage.getItem("products")) || [];

  const newProduct = {
    id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
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

document
  .getElementById("open-modal")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("new-product-modal").style.display = "block";
  });

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", function (e) {
    if (e.target === this) {
      this.style.display = "none";
    }
  });
});
