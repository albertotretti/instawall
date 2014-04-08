;(function (window, $) {

  var count = 0;

  /**
   * ImageTile:
   *     A static image tile for the InstaWall
   *
   * Constructor parameters:
   *
   * - src: [url]
   *     the src url for the image tag
   *
   * - options: [object]
   *     - width/height:
   *         the dimensions of the tile
   *
   *     - onLoad: [function]
   *         callback called when the tile is loaded
   *         and applyied to the tile   
   *     
   */
  var ImageTile = function (src, options) {
    
    var tile = this;

    // Merge defaults
    tile.options = $.extend({
      
      // Dimensions
      width:  320,
      height: 360,

      onLoad: $.noop

    }, options);

    tile.options.onLoad.apply(tile);
    tile.loaded = true;

    // Create html elements
    tile.container = $('<div class="instatile imagetile"></div>'); 
    tile.image     = $('<img src="' + src + '"></ul>');

    tile.container.css("width",  tile.options.width  + "px");
    tile.container.css("height", tile.options.height + "px");
    tile.container.append(tile.image);

  };


  ImageTile.prototype.onLoad = function (callback) {
    callback.apply(this);
  };

  Image.prototype.destroy = function () {
    this.container.remove();
  };  

  window.ImageTile = ImageTile;

})(window, jQuery);