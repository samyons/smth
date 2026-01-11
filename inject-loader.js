(function() {
  if (window.location.search.includes('cat=viewTransaction_cs')) {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL('inject.js');
    s.type = 'text/javascript';
    s.onload = function() {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
  }
})();
