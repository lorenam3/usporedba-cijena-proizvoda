document.addEventListener("DOMContentLoaded", () => {
  fetch("products.json")
    .then((response) => response.json())
    .then((data) => {
      prikaziProizvode(data.filter((p) => p.istaknuto));
    })
    .catch((error) => console.error("Greška pri učitavanju podataka:", error));
});

function prikaziProizvode(proizvodi) {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  proizvodi.forEach((proizvod) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${proizvod.naziv}</td>
            <td>${proizvod.kategorija}</td>
            <td>${proizvod.cijena_2024.toFixed(2)} €</td>
            <td>${proizvod.cijena_2025.toFixed(2)} €</td>
            <td>${izracunajPostotak(
              proizvod.cijena_2024,
              proizvod.cijena_2025
            )}</td>
        `;
    productList.appendChild(row);
  });

  azurirajUkupno(proizvodi);
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", function () {
    const kategorija = this.getAttribute("data-category");

    document.querySelector("h2").textContent = kategorija;

    fetch("products.json")
      .then((response) => response.json())
      .then((data) => {
        let filtriraniProizvodi = data.filter(
          (p) => p.kategorija === kategorija
        );
        prikaziProizvode(filtriraniProizvodi);
      })
      .catch((error) =>
        console.error("Greška pri učitavanju podataka:", error)
      );
  });
});

function izracunajPostotak(cijena_2024, cijena_2025) {
  let postotak = (((cijena_2025 - cijena_2024) / cijena_2024) * 100).toFixed(2);
  return postotak > 0 ? `+${postotak}%` : `${postotak}%`;
}

function azurirajUkupno(proizvodi) {
  const total2024 = proizvodi.reduce((sum, p) => sum + p.cijena_2024, 0);
  const total2025 = proizvodi.reduce((sum, p) => sum + p.cijena_2025, 0);
  const totalChange = izracunajPostotak(total2024, total2025);

  document.getElementById("total-2024").textContent =
    total2024.toFixed(2) + " €";
  document.getElementById("total-2025").textContent =
    total2025.toFixed(2) + " €";
  document.getElementById("total-change").textContent = totalChange;
}

document.getElementById("search").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    let searchTerm = this.value.trim().toLowerCase();

    fetch("products.json")
      .then((response) => response.json())
      .then((data) => {
        let foundProduct = data.find((p) =>
          p.naziv.toLowerCase().includes(searchTerm)
        );

        if (foundProduct) {
          prikaziProizvode([foundProduct]);

          let category = foundProduct.kategorija.toLowerCase();
          let categoryButton = document.querySelector(
            `.tab[data-category="${category}"]`
          );
          if (categoryButton) {
            categoryButton.click();
          }
        } else {
          const productList = document.getElementById("product-list");
          productList.innerHTML = `
              <tr>
                <td colspan="5" style="text-align: center;">Nema traženog proizvoda.</td>
              </tr>
              <tr>
                <td colspan="5" style="text-align: center;">
                  <button id="add-product-btn">Dodaj novi proizvod</button>
                </td>
              </tr>
            `;

          azurirajUkupno([]);

          document
            .getElementById("add-product-btn")
            .addEventListener("click", () => {
              window.location.href = "admin.html";
            });
        }
      })
      .catch((error) =>
        console.error("Greška pri učitavanju podataka:", error)
      );
  }
});
