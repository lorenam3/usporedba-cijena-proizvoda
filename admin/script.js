document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();

  document
    .getElementById("cancel-edit")
    .addEventListener("click", closeEditModal);
  document
    .getElementById("modal-overlay")
    .addEventListener("click", closeEditModal);

  document
    .getElementById("add-product")
    .addEventListener("click", openNewProductModal);
  document
    .getElementById("cancel-new")
    .addEventListener("click", closeNewProductModal);

  document.getElementById("save-new").addEventListener("click", saveNewProduct);
});

function fetchProducts() {
  let products = JSON.parse(localStorage.getItem("products")) || [];

  if (products.length === 0) {
    fetch("../products.json")
      .then((response) => response.json())
      .then((data) => {
        localStorage.setItem("products", JSON.stringify(data));
        displayProducts(data);
      })
      .catch((error) =>
        console.error("Greška pri dohvaćanju podataka:", error)
      );
  } else {
    displayProducts(products);
  }
}

function displayProducts(products) {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  products.forEach((product) => {
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

  addEventListeners(products);
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
  const modalOverlay = document.getElementById("modal-overlay");

  document.getElementById("edit-name").value = product.naziv;
  document.getElementById("edit-category").value = product.kategorija;
  document.getElementById("edit-price").value = product.cijena_2025;

  modal.style.display = "block";
  modalOverlay.style.display = "block";

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
  document.getElementById("modal-overlay").style.display = "none";
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
  document.getElementById("new-name").value = "";
  document.getElementById("new-category").value = "Potrepštine";
  document.getElementById("new-price-2024").value = "";
  document.getElementById("new-price-2025").value = "";
  document.getElementById("new-highlighted").checked = false;
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

  if (
    !newProduct.naziv ||
    newProduct.cijena_2024 <= 0 ||
    newProduct.cijena_2024 <= 0
  ) {
    alert("Molimo unesite ispravan naziv i cijenu.");
    return;
  }

  products.push(newProduct);
  localStorage.setItem("products", JSON.stringify(products));

  closeNewProductModal();
  displayProducts(products);
}
