/*
Template Name: Velzon - Admin & Dashboard Template
Author: Themesbrand
Version: 3.0.0
Website: https://Themesbrand.com/
Contact: Themesbrand@gmail.com
File: Common Plugins Js File
*/

//Common plugins
if (
  document.querySelector("[toast-list]") ||
  document.querySelector('[data-choices]') ||
  document.querySelector("[data-provider]")
) {
  const scripts = [
    "https://cdn.jsdelivr.net/npm/toastify-js",
    "build/libs/choices.js/public/assets/scripts/choices.min.js",
    "build/libs/flatpickr/flatpickr.min.js"
  ];

  scripts.forEach((src) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    script.defer = true; // Ensures scripts are executed in order
    document.body.appendChild(script);
  });
}
