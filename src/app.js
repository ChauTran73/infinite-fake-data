(function (angular) {
  if (typeof Faker === 'undefined') {
    throw new Error('Cannot find Faker.js');
  }

  // configure the loading bar for http requests
  function showLoader(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
  }

  // delay mock backend responses by N seconds
  function slowDownHttp($provide) {
    var DELAY_MS = 1000; // ms
    $provide.decorator('$httpBackend', function ($delegate) {
      var proxy = function(method, url, data, callback, headers) {
        var interceptor = function() {
          var _this = this, _arguments = arguments;
          setTimeout(function() {
            // return result to the client AFTER delay
            callback.apply(_this, _arguments);
          }, DELAY_MS);
        };
        return $delegate.call(this, method, url, data, interceptor, headers);
      };
      for (var key in $delegate) {
        proxy[key] = $delegate[key];
      }
      return proxy;
    });
  }

  function returnFakePeople($httpBackend) {
    var sliceRegExp = /\/people\/slice\/(\d+)\/(\d+)/;
    $httpBackend.whenGET(sliceRegExp).respond(function(method, url, data) {
      var indices = sliceRegExp.exec(url);
      var from = indices[1];
      var to = indices[2];

      var people = [];
      var MAX_N = to - from;
      console.assert(MAX_N >= 0, 'invalid from and to indcies ' + from + ', ' + to);
      for (var k = 0; k < MAX_N; k += 1) {
        var person = {
          email: Faker.Internet.email(),
          firstname: Faker.Name.firstName(),
          lastname: Faker.Name.lastName()
        };
        people.push(person);
      }
      return [200, people];
    });
  }

  angular.module('tester', ['infinite-fake-data', 'ngMockE2E', 'chieffancypants.loadingBar'])
    .config(showLoader)
    .config(slowDownHttp)
    .run(returnFakePeople);
}(window.angular));