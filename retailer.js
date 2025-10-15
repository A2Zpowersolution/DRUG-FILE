// retailer.js — Retailer's frontend behaviour (fixed)
(function () {
  const form = document.getElementById("retailerForm");
  const overlay = document.getElementById("overlay");
  const overlayText = document.getElementById("overlayText");
  const STORAGE_KEY = "retailer_form_v1";
  const UPLOADS_KEY = "retailer_uploads_v1";

  document.addEventListener("DOMContentLoaded", () => {
    restoreForm();
    bindInputs();
    bindFileInputs();
    document.getElementById("saveBtn").addEventListener("click", saveLocally);
    document.getElementById("submitBtn").addEventListener("click", handleSubmit);
  });

  function bindInputs() {
    form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea, select, input[type="checkbox"]').forEach((el) => {
      el.addEventListener("change", saveLocally);
    });
  }

  // === FILE UPLOAD ===
  function bindFileInputs() {
    form.querySelectorAll('input[type="file"]').forEach((input) => {
      input.addEventListener("change", async () => {
        const file = input.files[0];
        const name = input.getAttribute("name");
        const status = document.querySelector(`.status[data-for="${name}"]`);
        if (!file) return;
        status.textContent = "Uploading...";

        try {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("field", name);
          const res = await fetch("upload_file.php", { method: "POST", body: fd });
          const json = await res.json();
          if (json.success) {
            const uploads = loadJSON(UPLOADS_KEY) || {};
            uploads[name] = json.path;
            localStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads));
            status.textContent = "Saved on server";
          } else {
            status.textContent = "Upload failed";
          }
        } catch (err) {
          console.error(err);
          status.textContent = "Upload error";
        }
      });

      // show "Already uploaded" if found
      const savedUploads = loadJSON(UPLOADS_KEY) || {};
      if (savedUploads[input.name]) {
        const status = document.querySelector(`.status[data-for="${input.name}"]`);
        if (status) status.textContent = "Already uploaded";
      }
    });
  }

  // === LOCAL SAVE ===
  function saveLocally() {
    const data = {};
    form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea, select').forEach((el) => {
      data[el.name] = el.value;
    });
    form.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      data[cb.name] = cb.checked;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    flashSaved();
  }

  function restoreForm() {
    const data = loadJSON(STORAGE_KEY) || {};
    Object.keys(data).forEach((k) => {
      const el = form.elements[k];
      if (!el) return;
      if (el.type === "checkbox") el.checked = data[k];
      else el.value = data[k];
    });

    // restore upload statuses
    const uploads = loadJSON(UPLOADS_KEY) || {};
    Object.keys(uploads).forEach((k) => {
      const status = document.querySelector(`.status[data-for="${k}"]`);
      if (status) status.textContent = "Already uploaded";
    });
  }

  function loadJSON(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      return null;
    }
  }

  function flashSaved() {
    const btn = document.getElementById("saveBtn");
    btn.textContent = "Saved";
    setTimeout(() => (btn.textContent = "Save (Local)"), 900);
  }

  // === VALIDATION ===
  function validate() {
    let ok = true;
    const required = ["prop_name", "prop_phone", "prop_email", "prop_address", "phar_name", "phar_phone", "phar_email", "phar_qual"];
    required.forEach((name) => {
      const el = form.elements[name];
      if (!el) return;
      if (!el.value || (el.type === "select-one" && el.value === "")) {
        el.classList.add("invalid");
        setTimeout(() => el.classList.remove("invalid"), 450);
        ok = false;
      }
    });
    return ok;
  }

  // === SUBMIT ===
  async function handleSubmit() {
    if (!validate()) {
      alert("Please fill all required fields highlighted in red.");
      return;
    }

    // show overlay only now
    overlay.classList.remove("hidden");
    overlayText.textContent = "Preparing files...";

    try {
      const formData = new FormData();
      form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea, select').forEach((el) => {
        formData.append(el.name, el.value || "");
      });
      form.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        formData.append(cb.name, cb.checked ? "1" : "0");
      });

      // include uploaded paths
      const uploads = loadJSON(UPLOADS_KEY) || {};
      Object.keys(uploads).forEach((k) => formData.append(`uploaded_paths[${k}]`, uploads[k]));

      overlayText.textContent = "Sending application...";

      const res = await fetch("send_mail.php", { method: "POST", body: formData });
      const json = await res.json();

      if (json.success) {
        overlayText.textContent = "✅ Submitted successfully!";
        setTimeout(() => {
          overlay.classList.add("hidden");
          alert("Application submitted successfully. You will receive a confirmation email.");
        }, 1000);
      } else {
        overlayText.textContent = "❌ Submission failed";
        setTimeout(() => {
          overlay.classList.add("hidden");
          alert("Submit failed: " + (json.error || "unknown"));
        }, 1000);
      }
    } catch (err) {
      console.error("Error:", err);
      overlayText.textContent = "❌ Network error";
      setTimeout(() => {
        overlay.classList.add("hidden");
        alert("Error sending: " + err.message);
      }, 1000);
    }
  }
})();
