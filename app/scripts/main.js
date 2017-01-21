/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }

  // Your custom JavaScript goes here
})();


/* dialog
(function() {
  'use strict';
  var dialog = document.querySelector('#modal-example');
  var closeButton = dialog.querySelector('button');
  var showButton = document.querySelector('#show-modal-example');
  if (! dialog.showModal) {
    dialogPolyfill.registerDialog(dialog);
  }
  var closeClickHandler = function(event) {
    dialog.close();
  };
  var showClickHandler = function(event) {
    dialog.showModal();
  };
  showButton.addEventListener('click', showClickHandler);
  closeButton.addEventListener('click', closeClickHandler);
}());
*/

var map,
    defaultPosition,
    Restaurants = {},
    userLocation
    data = {
      location:{
        lat:"",
        lng:""
      }
    };


/* Services */
var RestaurantFactory = {
  getRestaurants: function(data, output) {
    $.ajax({
      url: 'http://localhost:1234/api' + '/restaurant ',
      method: 'GET',
      data: {},
      success: function(response) {
        output(response);
      }
    })
  }
};




function initMap() {
  defaultPosition = new google.maps.LatLng(46.051343, 14.506293);
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: defaultPosition,
    mapTypeId: 'roadmap'
  });

}

function init() {

  /* Get restaurants */
  RestaurantFactory.getRestaurants("", function(response){
    Restaurants = response;

    $.Mustache.load('templates/restaurants.html')
      .done(function () {
        $('#test-restaurants').mustache('restavracije', Restaurants);
      });

  });

  /* scoll header */
  window.addEventListener('scroll', function(e){
    var distanceY = window.pageYOffset || document.documentElement.scrollTop,
      shrinkOn = 150,
      header = document.querySelector("header");

    if (distanceY > shrinkOn) {
      classie.add(header,"smaller");
    } else {
      if (classie.has(header,"smaller")) {
        classie.remove(header,"smaller");
      }
    }
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showOnMap);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }

  // else 1 default to city center, Ljubljana
  // else 2 ask use for location
  //46.051343, 14.506293
  function showOnMap(position) {
    console.log("User: " + "lat: " + position.coords.latitude +
      " lng: " + position.coords.longitude);

    userLocation = new google.maps.LatLng(position.coords.latitude,  position.coords.longitude);
    map.setCenter(userLocation);

    var marker = new google.maps.Marker({
      position: userLocation,
      map: map,
      icon: '../app/images/me-marker.png'
    });


    // add markers
    var infowindow = new google.maps.InfoWindow(),
        marker,
        i;

    for (i = 0; i < Restaurants.length; i++) {

       marker = new google.maps.Marker({
         position: new google.maps.LatLng(Restaurants[i].location.lat, Restaurants[i].location.lng),
         map: map,
         icon: '../app/images/map-marker.png'
       });

       google.maps.event.addListener(marker, 'click', (
         function(marker, i) {
           return function() {
             infowindow.setContent(Restaurants[i].name);
             infowindow.open(map, marker);
           }
        })(marker, i));
     }

    data.location.lat = position.coords.latitude;
    data.location.lng = position.coords.longitude;
    console.log(data);

    RestaurantFactory.getRestaurants(data, function(response){
      Restaurants = response;

      $.Mustache.load('templates/restaurants.html')
        .done(function () {
          $('#test-restaurants').mustache('restavracije', Restaurants);
        });

    });
  }
}






window.onload = init();
