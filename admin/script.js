document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
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
            <button class="edit-btn" data-id="${product.id}">✏️ Uredi</button>
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
  const modal = document.getElementById("edit-modal");
  const modalOverlay = document.getElementById("modal-overlay");

  document.getElementById("edit-name").value = product.naziv;
  document.getElementById("edit-category").value = product.kategorija;
  document.getElementById("edit-price").value = product.cijena_2025;

  modal.style.display = "block";
  modalOverlay.style.display = "block";

  document.getElementById("save-edit").onclick = function () {
    saveProductChanges(product.id);
  };

  document.getElementById("cancel-edit").onclick = function () {
    closeEditModal();
  };
}

function saveProductChanges(productId) {
  let products = JSON.parse(localStorage.getItem("products")) || [];
  let product = products.find((p) => p.id == productId);

  product.naziv = document.getElementById("edit-name").value;
  product.kategorija = document.getElementById("edit-category").value;
  product.cijena_2025 = parseFloat(document.getElementById("edit-price").value);
  product.posljednja_izmjena = new Date().toLocaleString("hr-HR");

  localStorage.setItem("products", JSON.stringify(products));

  closeEditModal();
  fetchProducts();
}

function closeEditModal() {
  document.getElementById("edit-modal").style.display = "none";
  document.getElementById("modal-overlay").style.display = "none";
}

function deleteProduct(id) {
  if (confirm("Jeste li sigurni da želite obrisati proizvod?")) {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products = products.filter((p) => p.id != id);
    localStorage.setItem("products", JSON.stringify(products));
    fetchProducts();
  }
}
