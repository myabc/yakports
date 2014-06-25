HAL.Browser = Backbone.Router.extend({
  initialize: function(opts) {
    opts = opts || {};

    var vent = _.extend({}, Backbone.Events),
    $container = opts.container || $('#browser');

    this.entryPoint = opts.entryPoint || '/';

    // TODO: don't hang currentDoc off namespace
    vent.bind('response', function(e) {
      window.HAL.currentDocument = e.resource || {};
    });

    vent.bind('location-go', _.bind(this.loadUrl, this));

    HAL.client = new HAL.Http.Client({ vent: vent });

    var browser = new HAL.Views.Browser({ vent: vent, entryPoint: this.entryPoint });
    browser.render()

    $container.html(browser.el);
    vent.trigger('app:loaded');

    if (window.location.hash === '') {
      window.location.hash = this.entryPoint;
    }

    if(location.hash.slice(1,9) === 'NON-GET:') {
      new HAL.Views.NonSafeRequestDialog({
            href: location.hash.slice(9),
            vent: vent
          }).render({});
    }
  },

  routes: {
    '*url': 'resourceRoute'
  },

  loadUrl: function(url) {
    // if fully qualified and from a different origin no use trying to load it,
    // just move the browser along and hope for the best
    if (url.indexOf('http') === 0 && url.indexOf(window.location.origin) === -1) {
      window.location = url;
    } else {
      if (this.getHash() === url) {
        HAL.client.get(url);
      } else {
        window.location.hash = url;
      }
    }
  },

  getHash: function() {
    return window.location.hash.slice(1);
  },

  resourceRoute: function() {
    url = location.hash.slice(1);
    console.log('target url changed to: ' + url);
    if (url.slice(0,8) !== 'NON-GET:') {
      HAL.client.get(url);
    }
  }
});
