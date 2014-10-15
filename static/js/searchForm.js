var searchFormApp = angular.module('searchFormApp', []);

searchFormApp.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
}]);

searchFormApp.controller('searchForm', ['$scope', '$http', function($scope, $http){	
	$scope.url = "/search/";
  $scope.searchText = "";
	$scope.goSearch = function(){
    window.location = $scope.url+$scope.searchText;
    return false;
  }
  
}])