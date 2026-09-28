/* Arabella Motor Inn Google Ads landing page.
   Tracks booking and phone clicks via dataLayer for GTM / Google Ads.
   Set gtmId when the Google Tag Manager container exists. Do not invent a conversion ID. */
window.AMI_CONFIG = {
  gtmId: "",
  bookingUrl: "https://book-directonline.com/properties/southtweedmidirect"
};

(function () {
  var config = window.AMI_CONFIG;
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

  document.addEventListener("click", function (event) {
    var el = event.target.closest("[data-conversion]");
    if (!el) return;
    track(el.getAttribute("data-conversion"), {
      link_url: el.getAttribute("href") || "",
      link_text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
      room: el.getAttribute("data-room") || ""
    });
  }, true);
})();
