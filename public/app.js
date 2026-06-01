async function loadProfile() {
  const response = await fetch("/api/profile");

  if (!response.ok) {
    throw new Error("Unable to load profile data.");
  }

  return response.json();
}

function renderProfile(profile) {
  document.getElementById("hero-name").textContent = profile.name;
  document.getElementById("hero-title").textContent = profile.title;
  document.getElementById("hero-summary").textContent = profile.summary;

  const aboutContent = document.getElementById("about-content");
  aboutContent.innerHTML = profile.about
    .map(
      (paragraph) => `
        <article class="about-card fade-in">
          <p>${paragraph}</p>
        </article>
      `
    )
    .join("");

  const highlights = document.getElementById("highlights");
  highlights.innerHTML = profile.highlights
    .map(
      (item, index) => `
        <article class="highlight-card fade-in">
          <h3>0${index + 1}</h3>
          <p>${item}</p>
        </article>
      `
    )
    .join("");

  const stack = document.getElementById("stack");
  stack.innerHTML = profile.stack
    .map((tool) => `<span class="stack-item fade-in">${tool}</span>`)
    .join("");

  const stats = document.getElementById("stats");
  stats.innerHTML = profile.stats
    .map(
      (item) => `
        <article class="stat-card fade-in">
          <strong>${item.label}</strong>
          <span>${item.value}</span>
        </article>
      `
    )
    .join("");
}

async function checkBackendStatus() {
  const statusElement = document.getElementById("api-status");

  try {
    const response = await fetch("/api/health");
    const result = await response.json();
    statusElement.textContent =
      result.status === "ok" ? "Backend is live and ready." : "Backend response received.";
  } catch (error) {
    statusElement.textContent = "Backend is currently unavailable.";
  }
}

function setupContactForm() {
  const form = document.getElementById("contact-form");
  const messageElement = document.getElementById("form-message");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageElement.textContent = "Sending...";
    messageElement.className = "form-message";

    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message")
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to send message.");
      }

      form.reset();
      messageElement.textContent = result.message;
      messageElement.className = "form-message success";
    } catch (error) {
      messageElement.textContent = error.message;
      messageElement.className = "form-message error";
    }
  });
}

async function init() {
  try {
    const profile = await loadProfile();
    renderProfile(profile);
  } catch (error) {
    document.getElementById("hero-summary").textContent =
      "Profile data could not be loaded right now.";
  }

  checkBackendStatus();
  setupContactForm();
}

init();
