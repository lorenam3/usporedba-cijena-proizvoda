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
