const ERROR_DIR = "errors/";
const BATCH_PREFIX = "err-b-"; 
let db = [];

const MAX_BATCHES = 20;
const batches = Array.from({ length: MAX_BATCHES }, (_, i) => `err-b-${i + 1}.json`);


// Load all JSON files
async function loadErrors() {
  for (const file of batches) {
    try {
      const res = await fetch(`${ERROR_DIR}${file}`);
      const data = await res.json();
      db = db.concat(data);
    } catch (err) {
      console.warn(`⚠ Failed to load ${file}`, err);
    }
  }
  console.log(`Loaded ${db.length} error entries.`);
}

// Search logic
function searchErrors(query) {
  const q = query.toLowerCase();

  return db.filter(entry =>
    // ID lookup
    entry.id?.toLowerCase().includes(q) ||

    // Error message
    entry.error?.toLowerCase().includes(q) ||

    // Category lookup
    entry.category?.toLowerCase().includes(q) ||

    // Aliases
    entry.aliases?.some(a => a.toLowerCase().includes(q))
  );
}

// Render result
function renderResults(results) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML =
      `<p>Uh Oh... It seems that the error you are looking for has not been added yet to GEMS.</p>`;
    return;
  }

  results.forEach(entry => {
    container.innerHTML += `
      <div class="result">
        <p class="error">${entry.error}</p>

        <p><strong>GEMS ID:</strong> ${entry.id}</p>
        <p><strong>Category:</strong> ${entry.category || "Uncategorized"}</p>

        ${entry.meaning ? `<p><strong>Meaning:</strong> ${entry.meaning}</p>` : ""}

        ${entry.causes?.length ? `
          <p><strong>Common Causes:</strong></p>
          <ul>${entry.causes.map(c => `<li>${c}</li>`).join("")}</ul>
        ` : ""}

        ${entry.fixes?.length ? `
          <p><strong>Fixes:</strong></p>
          <ul>${entry.fixes.map(f => `<li>${f}</li>`).join("")}</ul>
        ` : ""}

        ${entry.version?.length
          ? `<p><strong>Godot Versions:</strong> ${entry.version.join(", ")}</p>`
          : ""}
      </div>
    `;
  });
}


// Intialize
document.getElementById("search").addEventListener("input", e => {
  const query = e.target.value.trim();
  if (query.length < 1) {
    document.getElementById("results").innerHTML = "";
    return;
  }
  renderResults(searchErrors(query));
});

loadErrors();
