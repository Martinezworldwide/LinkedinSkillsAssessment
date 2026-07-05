const skills = Array.isArray(window.SKILLS) ? window.SKILLS : [];

const state = {
  query: "",
  category: "All",
};

const categories = ["All", ...Array.from(new Set(skills.map((skill) => skill.category))).sort()];

const elements = {
  totalSkills: document.querySelector("#totalSkills"),
  categoryCount: document.querySelector("#categoryCount"),
  visibleCount: document.querySelector("#visibleCount"),
  countNote: document.querySelector("#countNote"),
  filterRow: document.querySelector("#filterRow"),
  searchInput: document.querySelector("#searchInput"),
  skillsList: document.querySelector("#skillsList"),
};

function normalize(value) {
  return String(value || "").toLowerCase();
}

function matchesQuery(skill) {
  if (!state.query) return true;
  const haystack = [
    skill.skill,
    skill.license,
    skill.pricing,
    skill.platforms,
    skill.complements,
    skill.details,
    skill.proof,
    skill.category,
  ]
    .map(normalize)
    .join(" ");
  return haystack.includes(state.query);
}

function matchesCategory(skill) {
  return state.category === "All" || skill.category === state.category;
}

function visibleSkills() {
  return skills.filter((skill) => matchesCategory(skill) && matchesQuery(skill));
}

function field(label, value, className = "") {
  return `
    <div class="field ${className}">
      <dt>${escapeHtml(label)}</dt>
      <dd>${formatProof(label, value)}</dd>
    </div>
  `;
}

function formatProof(label, value) {
  const safeValue = escapeHtml(value || "");
  if (label !== "Proof URL") return safeValue;
  if (!value || value.startsWith("Add ")) {
    return `<span class="proof-placeholder">${safeValue}</span>`;
  }
  return `<a class="proof-link" href="${safeValue}" target="_blank" rel="noreferrer">${safeValue}</a>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderFilters() {
  elements.filterRow.innerHTML = categories
    .map(
      (category) => `
        <button
          class="filter-chip"
          type="button"
          aria-pressed="${category === state.category}"
          data-category="${escapeHtml(category)}"
        >${escapeHtml(category)}</button>
      `,
    )
    .join("");

  elements.filterRow.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    render();
  });
}

function renderSkills() {
  const rows = visibleSkills();
  elements.visibleCount.textContent = rows.length;

  if (!rows.length) {
    elements.skillsList.innerHTML = `<div class="empty-state">No skills match the current search and filter.</div>`;
    return;
  }

  elements.skillsList.innerHTML = rows
    .map(
      (skill) => `
        <article class="skill-card">
          <div>
            <h3>${escapeHtml(skill.skill)}</h3>
            <span class="category">${escapeHtml(skill.category)}</span>
          </div>
          <dl class="skill-fields">
            ${field("License", skill.license)}
            ${field("Pricing", skill.pricing)}
            ${field("Platforms", skill.platforms)}
            ${field("Complements", skill.complements)}
            ${field("Details", skill.details, "full")}
            ${field("Proof URL", skill.proofUrl || skill.proof, "full")}
          </dl>
        </article>
      `,
    )
    .join("");
}

function render() {
  document.querySelectorAll(".filter-chip").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.category === state.category));
  });
  renderSkills();
}

function initCopyButtons() {
  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.querySelector(`#${button.dataset.copyTarget}`);
      if (!target) return;
      await navigator.clipboard.writeText(target.value);
      const original = button.textContent;
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1400);
    });
  });
}

elements.totalSkills.textContent = skills.length;
elements.categoryCount.textContent = categories.length - 1;
elements.countNote.textContent = skills.length;

elements.searchInput.addEventListener("input", (event) => {
  state.query = normalize(event.target.value).trim();
  render();
});

renderFilters();
render();
initCopyButtons();
