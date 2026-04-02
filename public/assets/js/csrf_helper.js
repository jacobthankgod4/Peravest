(function(){
  // Read CSRF token from meta tag
  function getCsrf() {
    var m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.getAttribute('content') : null;
  }

  var token = getCsrf();
  if (!token) return;

  // Attach to jQuery AJAX calls if jQuery present
  if (window.jQuery) {
    window.jQuery.ajaxSetup({
      headers: {
        'X-CSRF-Token': token
      }
    });
  }

  // Monkey-patch fetch to include header by default
  if (window.fetch) {
    var _fetch = window.fetch;
    window.fetch = function(resource, init) {
      init = init || {};
      init.headers = init.headers || {};
      if (!init.headers['X-CSRF-Token'] && !init.headers['x-csrf-token']) {
        init.headers['X-CSRF-Token'] = token;
      }
      return _fetch(resource, init);
    };
  }

})();
