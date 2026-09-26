/* All Time Storage Google Ads landing page.
   Form posts to the existing Contact Form 7 form on alltimestorage.com.au
   (form 1248: name, email, phone, message). Extra answers are placed in the message.
   Set gtmId when the Google Tag Manager container exists. Do not invent a conversion ID. */
window.ATS_CONFIG = {
  gtmId: "",
  endpoint: "https://alltimestorage.com.au/wp-json/contact-form-7/v1/contact-forms/1248/feedback",
  formId: "1248",
  formVersion: "5.7.6",
  locale: "en_US",
  unitTag: "wpcf7-f1248-p39-o1",
  postId: "39"
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
      "Storage requirement: " + requirement,
      "Approximate storage size: " + size,
      "Preferred start date: " + start,
      "Message: " + (message || "None")
    ].join("\n");

    var payload = new FormData();
    payload.append("_wpcf7", config.formId);
    payload.append("_wpcf7_version", config.formVersion);
    payload.append("_wpcf7_locale", config.locale);
    payload.append("_wpcf7_unit_tag", config.unitTag);
    payload.append("_wpcf7_container_post", config.postId);
    payload.append("text-46", name);
    payload.append("email-468", email);
    payload.append("text-184", phone);
    payload.append("textarea-493", details);

    var button = form.querySelector("[type=submit]");
    button.disabled = true;
    showStatus("Sending your storage enquiry…", false);

    fetch(config.endpoint, {
      method: "POST",
      body: payload,
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        return response.json().then(function (body) {
          return { ok: response.ok, body: body };
        });
      })
      .then(function (result) {
        var body = result.body || {};
        if (body.status === "mail_sent") {
          track("lead-form-submit", { form_id: config.formId });
          form.reset();
          showStatus("Thank you! Your storage enquiry has been received. Our team will get back to you shortly.", false);
          return;
        }
        if (body.status === "validation_failed") {
          var fields = body.invalid_fields || [];
          var text = fields.length
            ? fields.map(function (field) { return field.message; }).join(" ")
            : "Please check the form and try again.";
          showStatus(text + " Or call 02 6672 3248.", true);
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
