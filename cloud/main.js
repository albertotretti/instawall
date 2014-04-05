var ig = require('cloud/instagram-v1-1.0.js');
ig.initialize('c1ea7e4a8d1b4094ad57798d7d0ebe23');
ig.setAccessToken('969629.7ee45e1.564cf37667ee432fb08a8e91233f053f');
EMPTY_RESPONSE = { meta: { code: 500}, data: [{}] };


Parse.Cloud.define('updateSelfLikedMedia', function(request, response) {

  var token = "" + request.params.token;
  ig.setAccessToken(request.params.token);
  
  ig.getSelfLikedMedia({count: request.params.count}
                         ).then(function(httpResponse) {

    if (httpResponse.data.meta.code == '200' && httpResponse.data.data.length > 0) {

      var SelfLiked = Parse.Object.extend("IGLikedMedia");
      var query = new Parse.Query(SelfLiked);
      query.equalTo("token", token);
      query.find({
        success: function(results) {
          console.log("Query found");
          if (results.length > 0) {
            var object = results[0];
            console.log('Updating existing object: ' + object.id);
            object.set("response", httpResponse.text);
            object.save();
            console.log('done.');
          } else {
            console.log('Creating new object...');
            var selfLikedMedia = new SelfLiked();
            selfLikedMedia.set("response", httpResponse.text);
            selfLikedMedia.set("token", token);
            selfLikedMedia.save();
            console.log('done.');
          }
          response.success(httpResponse.data);
        },
        error: function(error) {
          console.error('Unable to query database: '+ error);
          response.success(httpResponse.data);
        }
      });
    } else {
      console.error('Unable to parse response from Instagram API:' + httpResponse.data);
    }
  },
  function(error) {
    response.error(error);
  });
});

Parse.Cloud.define('updateRecentMediaByUser', function(request, response) {

  // Storing the userId as a string
  var userId = "" + request.params.userId;
  
  ig.getRecentMediaByUser(userId,
                          {count: request.params.count}
                         ).then(function(httpResponse) {

    if (httpResponse.data.meta.code == '200' && httpResponse.data.data.length > 0) {

      var RecentMedia = Parse.Object.extend("IGRecentMedia");
      var query = new Parse.Query(RecentMedia);
      query.equalTo("userId", userId);
      query.find({
        success: function(results) {
          console.log("Query found");
          if (results.length > 0) {
            var object = results[0];
            console.log('Updating existing object: ' + object.id);
            object.set("response", httpResponse.text);
            object.save();
            console.log('done.');
          } else {
            console.log('Creating new object...');
            var recentMedia = new RecentMedia();
            recentMedia.set("response", httpResponse.text);
            recentMedia.set("userId", userId);
            recentMedia.save();
            console.log('done.');
          }
          response.success(httpResponse.data);
        },
        error: function(error) {
          console.error('Unable to query database: '+ error);
          response.success(httpResponse.data);
        }
      });
    } else {
      console.error('Unable to parse response from Instagram API.');
    }
  },
  function(error) {
    response.error(error);
  });
});

Parse.Cloud.define('getSelfLikedMedia', function(request, response) {

  var query = new Parse.Query("IGLikedMedia");
  query.equalTo("token", request.params.token);
  query.find({
    success: function(results) {
      console.log("Successfully retrieved " + results.length + " entries.");
      
      if(results.length == 0) {
        response.success(EMPTY_RESPONSE);
      } else {
        var output = eval('(' + results[0].get('response') + ')');
        output["callback"] = "" + request.params.callback;
        response.success(output);
      }
    },
    error: function(error) {
      response.error(error);
    }
  });
});

Parse.Cloud.define('getRecentMediaByUser', function(request, response) {

  var query = new Parse.Query("IGRecentMedia");
  query.equalTo("userId", request.params.userId);
  query.find({
    success: function(results) {
      console.log("Successfully retrieved " + results.length + " entries.");
      
      if(results.length == 0) {
        response.success(EMPTY_RESPONSE);
      } else {
        var output = eval('(' + results[0].get('response') + ')');
        output["callback"] = "" + request.params.callback;
        response.success(output);
      }
    },
    error: function(error) {
      response.error(error);
    }
  });
});