;(function (window, $) {

  var count = 0;

  /**
   * InstaTile:
   *     A single tile of the InstaWall
   *
   * Constructor parameters:
   * - feed: [object]
   *     - get: ["user" or "liked"]
   *         whether to get the user photos or
   *         the photos liked by the user
   *
   *     - userId:
   *         the id of the user
   *         (for "user" feed only)
   *
   *     - accessToken:
   *         the access token of the user
   *         (for "liked" feed only)
   *
   *     - limit:
   *         number of photos to fetch
   *
   * - options: [object]
   *     - width/height:
   *         the dimensions of the tile
   *
   *     - animation:
   *         the desired bxSlider animation for
   *         this tile
   *
   *     - captions:
   *         whether to show captions on the photos
   *
   *     - onLoad: [function]
   *         callback called when the tile is loaded
   *         and applyied to the tile
   */
  var InstaTile = function (feed, options) {

    var tile = this;

    // Merge defaults
    tile.options = $.extend({

      // Dimensions
      width:  320,
      height: 360,

      captions:  true,
      animation: 'random',

      onLoad: $.noop

    }, options);

    tile.feed      = feed;
    tile.tileIndex = count++;
    tile.loaded    = false;

    // Create html elements
    tile.container     = $('<div class="instatile"></div>');
    tile.feedContainer = $('<ul id="instafeed-' + tile.tileIndex + '"></ul>');

    tile.container.css("width",  tile.options.width  + "px");
    tile.container.css("height", tile.options.height + "px");

    tile.loadingSandbox = $("<div></div>");
    tile.loadingSandbox.css({display: "none"});
    tile.loadingSandbox.appendTo("body");

    tile.loadingSandbox.append(tile.container);
    tile.container.append(tile.feedContainer);

    // FIXME remove the need of a loading sandbox
    setTimeout(function () {
      tile.loadingSandbox.remove();
    }, 10000);

    tile.loadFeed();

  };

  /**
   * #loadFeed
   * Loads the feed for this tile, replacing
   * the existing content of the feedContainer
   */
  InstaTile.prototype.loadFeed = function () {
    var tile = this;
    var instafeed = new Instafeed({

      // Target HTML element id
      target: this.feedContainer.attr('id'),

      // Used only if captions is true
      template: '<li><div><img src="{{image}}" title="@{{username}}"/></div></li>',

      get: tile.feed.get,
      userId: tile.feed.userId,
      accessToken: tile.feed.accessToken,
      limit: tile.feed.limit,

      // Not used for 'user' or 'liked'
      clientId: '',

      resolution: 'standard_resolution',

      after: function() {

        // Randomize pause time
        var pause = 7000 + 100 * (Math.floor(Math.random() * 40));

        // Randomize animation
        var animations = ["vertical", "horizontal", "fade"];
        var animation;
        if (tile.options.animation = "random") {
          animation  = animations[Math.floor(Math.random() * 3)];
        }
        else {
          animation = this.options.animation;
        }

        // Randomize start slide
        var slides     = tile.feedContainer.find("li")
        var startSlide = Math.floor(Math.random() * slides.size());

        // Fix dimensions
        var maxDimension = Math.max(tile.options.width, tile.options.height);
        var diff         = tile.options.width - tile.options.height;
        tile.feedContainer.find("img, li > div")
          .css("width",  maxDimension + "px")
          .css("height", maxDimension + "px");

        tile.feedContainer.find("li")
          .css("width",  tile.options.width  + "px")
          .css("height", tile.options.height + "px");

        // if width smaller than height...
        if (diff < 0) {
          tile.feedContainer.find("img").css("margin-left", diff/2 + "px");
        }

        // if height smaller than width...
        if (diff > 0) {
          tile.feedContainer.find("img").css("margin-top", (-1 * diff/2) + "px");
        }

        // Apply slider
        tile.feedContainer.bxSlider({
          mode: animation,
          startSlide: startSlide,
          auto: true,
          pause: pause,
          captions: tile.options.captions,
          pager: false,
          controls: false,
          responsive: false
        });

        tile.loaded = true;
        tile.options.onLoad.apply(tile);
      }
    });

    instafeed.run();

  };

  InstaTile.prototype.onLoad = function (callback) {
    var onLoad = this.options.onLoad;
    var tile = this;

    if (tile.loaded) {
      callback.apply(tile);
    }
    else {
      tile.options.onLoad = function () {
        onLoad.apply(this);
        callback.apply(this);
      }
    }
  };

  InstaTile.prototype.destroy = function () {
    this.feedContainer.destroySlider();
    this.container.remove();
  };

  window.InstaTile = InstaTile;

})(window, jQuery);