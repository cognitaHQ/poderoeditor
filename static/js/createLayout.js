var layoutFormApp = angular.module('createLayoutApp', []);

layoutFormApp.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
}]);

layoutFormApp.controller('createLayout', ['$scope', '$http', '$compile', function($scope, $http, $compile){
	
  });
}]) 