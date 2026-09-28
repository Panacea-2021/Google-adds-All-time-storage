/* All Time Storage Google Ads landing page.
   Quote form emails panacea.2126@gmail.com via FormSubmit.
   Set gtmId when the Google Tag Manager container exists. Do not invent a conversion ID. */
window.ATS_CONFIG = {
  gtmId: "",
  mailTo: "panacea.2126@gmail.com",
  endpoint: "https://formsubmit.co/ajax/panacea.2126@gmail.com"
};

(function () {
  var config = window.ATS_CONFIG;
  window.dataLayer = window.dataLayer || [];

  if (/^GTM-[A-Z0-9]+$/.test(config.gtmId || "")) {
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var gtm = document.createElement("script");
    gtm.async = true;
    gtm.src = "https://www.googletagmanager.com/gtm.js?id=" + config.gtmId;
    document.head.appendChild(gtm);
  }

  function track(name, extra) {
    window.dataLayer.push(Object.assign({
      event: "ads_conversion",
      conversion_name: name
    }, extra || {}));
  }

  var side = document.getElementById("side-call");
  var sideMin = side && side.querySelector(".side-call-min");
  if (side && sideMin) {
    sideMin.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      var collapsed = side.classList.toggle("is-collapsed");
      sideMin.setAttribute("aria-expanded", collapsed ? "false" : "true");
      sideMin.setAttribute("aria-label", collapsed ? "Show phone number" : "Hide phone number");
      sideMin.innerHTML = collapsed ? "&rarr;" : "&larr;";
    });
    side.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    });
  }

  document.addEventListener("click", function (event) {
    var el = event.target.closest("[data-conversion]");
    if (!el) return;
    var name = el.getAttribute("data-conversion");
    if (name === "lead-form-submit") return;

    var intent = el.getAttribute("data-intent");
    var size = el.getAttribute("data-size");
    var requirement = document.getElementById("storage-requirement");
    var sizeField = document.getElementById("storage-size");

    if (requirement && intent === "book") requirement.value = "Book storage";
    if (requirement && intent === "availability") requirement.value = "Check availability";
    if (requirement && intent === "quote" && !requirement.value) requirement.value = "";
    if (sizeField && size) sizeField.value = size;

    track(name, {
      link_url: el.getAttribute("href") || "",
      link_text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80)
    });
  }, true);

  var form = document.getElementById("enquiry-form");
  var statusEl = document.getElementById("form-status");
  if (!form || !statusEl) return;

  function showStatus(message, isError) {
    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.classList.toggle("error", !!isError);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    if ((data.get("company") || "").toString().trim()) return;

    if (!form.reportValidity()) return;

    var name = (data.get("name") || "").toString().trim();
    var phone = (data.get("phone") || "").toString().trim();
    var email = (data.get("email") || "").toString().trim();
    var requirement = (data.get("requirement") || "").toString().trim() || "Not specified";
    var size = (data.get("size") || "").toString().trim() || "Not sure yet";
    var start = (data.get("start") || "").toString().trim() || "Not specified";
    var message = (data.get("message") || "").toString().trim();

    var details = [
      "Google Ads storage enquiry",
      "Name: " + name,
      "Phone: " + phone,
      "Email: " + email,
      "Storage requirement: " + requirement,
      "Approximate storage size: " + size,
      "Preferred start date: " + start,
      "Message: " + (message || "None")
    ].join("\n");

    var button = form.querySelector("[type=submit]");
    button.disabled = true;
    showStatus("Sending your storage enquiry…", false);

    fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
        requirement: requirement,
        size: size,
        start_date: start,
        message: details,
        _subject: "All Time Storage quote enquiry from " + name,
        _replyto: email,
        _template: "table"
      })
    })
      .then(function (response) {
        return response.json().then(function (body) {
          return { ok: response.ok, body: body };
        }).catch(function () {
          return { ok: response.ok, body: {} };
        });
      })
      .then(function (result) {
        var body = result.body || {};
        var success = result.ok && (body.success === true || body.success === "true" || typeof body.success === "string");
        if (success) {
          track("lead-form-submit", { mail_to: config.mailTo });
          form.reset();
          showStatus("Thank you! Your storage enquiry has been received. Our team will get back to you shortly.", false);
          return;
        }
        showStatus("The enquiry could not be confirmed. Please call 02 6672 3248.", true);
      })
      .catch(function () {
        showStatus("The enquiry could not be sent from this page. Please call 02 6672 3248.", true);
      })
      .finally(function () {
        button.disabled = false;
      });
  });
})();
