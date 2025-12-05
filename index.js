const ERROR_DIR = "errors/";
const BATCH_PREFIX = "err-b-"; 
let db = [];

const MAX_BATCHES = 50;
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
  query = query.toLowerCase();
  return db.filter(entry =>
    entry.error.toLowerCase().includes(query) ||
    (entry.aliases && entry.aliases.some(a => a.toLowerCase().includes(query)))
  );
}

// Render result
function renderResults(results) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = `<p>No matching entry found yet.</p>`;
    return;
  }

  results.forEach(entry => {
    container.innerHTML += `
      <div class="divider"></div>
      <p class="error">${entry.error}</p>
      
      ${entry.meaning ? `<p><strong>Meaning:</strong> ${entry.meaning}</p>` : ""}
      
      ${entry.causes && entry.causes.length ? `
        <p><strong>Common Causes:</strong></p>
        <ul>${entry.causes.map(c => `<li>${c}</li>`).join("")}</ul>
      ` : ""}

      ${entry.fixes && entry.fixes.length ? `
        <p><strong>Fixes:</strong></p>
        <ul>${entry.fixes.map(f => `<li>${f}</li>`).join("")}</ul>
      ` : ""}

      ${entry.version ? `<p><strong>Godot Versions:</strong> ${entry.version.join(", ")}</p>` : ""}
    `;
  });
}


// Intialize
document.getElementById("search").addEventListener("input", e => {
  const query = e.target.value.trim();
  if (query.length < 2) {
    document.getElementById("results").innerHTML = "";
    return;
  }
  renderResults(searchErrors(query));
});

loadErrors();
