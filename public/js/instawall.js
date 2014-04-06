(function (window, $) {

  /**
   * InstaWall
   *    A nestable container for InstaTiles
   *
   * Constructor parameters:
   *
   * - columns:
   *     defines the total number of tile
   *     columns in the screen
   * 
   * - rows:
   *     defines the total number of tile
   *     rows in the screen
   *
   * - options: (object)
   *     - screenWidth/screenHeight: 
   *         total size of the screen in pixels, 
   *         null for using current window size 
   * 
   *     - tileWidth/tileHeight:
   *         size of each tile in pixels, null
   *         for automatic calculation based on
   *         screen size and row/column count
   *
   *     - onLoad: [function]
   *         callback called when the wall is loaded
   *         and applyied to the wall
   */
  var InstaWall = function (columns, rows, options) {

    var wall = this;

    wall.tiles = [];
    wall.rows = rows;
    wall.columns = columns;
    wall.loadedTiles = 0;
    wall.loaded = false;

    // Merge defaults
    wall.options = $.extend({

      // Screen
      screenWidth: null,
      screenHeight: null,

      // Tiles
      tileWidth: null,
      tileHeight: null,

      onLoad: $.noop
    
    }, options);

    // Auto screen size
    if (wall.options.screenWidth == null) {
      wall.options.screenWidth = $(window).width();
    }
    if (wall.options.screenHeight == null) {
      wall.options.screenHeight = $(window).height();
    }

    // Auto tile size
    if (wall.options.tileWidth == null) {
      wall.options.tileWidth = 
        Math.floor(wall.options.screenWidth / columns);
    }
    if (wall.options.tileHeight == null) {
      wall.options.tileHeight = 
        Math.floor(wall.options.screenHeight / rows);
    }

    wall.container = $("<div class='instawall'></div>");
    
    wall.container.css({
      width:   wall.options.screenWidth,
      height:  wall.options.screenHeight
    });

    wall.loadingSandbox = $("<div></div>");
    wall.loadingSandbox.css({display: "none"});
    wall.loadingSandbox.appendTo("body");

    wall.loadingSandbox.append(wall.container);

    // FIXME remove the need of a loading sandbox
    setTimeout(function () {
      wall.loadingSandbox.remove();
    }, 10000);

  };
  
  InstaWall.prototype.onLoad = function (callback) {
    var onLoad = this.options.onLoad;
    var wall = this;

    if (wall.loaded) {
      callback.apply(wall);
    }
    else {
      wall.options.onLoad = function () {
        onLoad.apply(this);
        callback.apply(this);
      }
    }
  };

  InstaWall.prototype.destroy = function () {
    $.each(this.tiles, function(i, tile) {
      tile.destroy();
    });
    this.container.remove();
  };

  InstaWall.prototype.addTile = function (tile) {
    var wall = this;
    wall.tiles.push(tile);
    wall.container.append(tile.container);
    tile.onLoad(function () {
      wall.loadedTiles++;
      if (wall.loadedTiles == wall.columns * wall.rows) {
        wall.loaded = true;
        wall.options.onLoad.apply(wall);
      }
    })
  };

  InstaWall.prototype.replaceTile = function (index, tile) {
    var wall    = this;
    var oldTile = wall.tiles.splice(index, 1, tile)[0];

    tile.container.css({
      "opacity": 0,
      "margin-left": (-1 * tile.container.width()) + "px"
    });
    oldTile.container.after(tile.container);
    
    tile.onLoad(function () {
      tile.container.animate({opacity: 1.0}, function () {
        oldTile.destroy();
        tile.container.css("margin-left", "0px");
      });
    });
  }

  InstaWall.prototype.createInstaTile = function (feed, options) {
    
    options = $.extend({
      width:  this.options.tileWidth,
      height: this.options.tileHeight,
      captions: null      
    }, options);

    if (options.captions == null) {
      options.captions = (feed.get == "liked");
    }

    var tile = new InstaTile({

      get:         feed.get,
      userId:      feed.userId,
      accessToken: feed.accessToken,
      limit:       30
    
    }, options);

    return tile;
  };

  InstaWall.prototype.addInstaTile = function (feed, options) {
    this.addTile(this.createInstaTile(feed, options));
  };

  InstaWall.prototype.createInstaTileset = function (columns, rows, feed) {
    
    var wall = new InstaWall(columns, rows, {
        screenWidth:  this.options.tileWidth,
        screenHeight: this.options.tileHeight      
    });

    for (i = 0; i < (columns * rows); i++) {
      wall.addInstaTile(feed, {
        captions: false
      });
    }

    return wall;

  };

  InstaWall.prototype.addInstaTileset = function (columns, rows, feed) {
    this.addTile(this.createInstaTileset(columns, rows, feed));
  };

  window.InstaWall = InstaWall;

})(window, jQuery);