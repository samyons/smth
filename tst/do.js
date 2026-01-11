// content-script.js
(function() {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL('i.js');
  s.type = 'text/javascript';
  s.onload = function() {
    // Optionnel : retirer la balise pour propreté
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
})();
