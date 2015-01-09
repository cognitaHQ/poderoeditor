var prepareApiApp = angular.module('prepareApiApp', []);

prepareApiApp.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
}]);

prepareApiApp.controller('classList', ['$scope','$http', function($scope, $http){
	$scope.classes = data;
  $scope.preds = [];
  $scope.selectedPreds = [];
  $scope.selectedClass = "";
  $scope.getPredicates = function(number){
    var headers = {headers:
      {
        'Accept': 'application/json'
      }
    };
    $scope.selectedClass = $scope.classes[number].c.value;
    $http.get("/add/"+$scope.selectedClass, headers).
    success(function(data, status, headers, config) {
      $scope.preds = data.main;
    });

  }

  $scope.addToSelection = function(event){
    var predPosition = $scope.selectedPreds.map(function(x) {return x.uri; }).indexOf($(event.target).attr("data-predicate"));
    if(predPosition < 0){
      $scope.selectedPreds.push({uri: $(event.target).attr("data-predicate"), name: $(event.target).attr("data-name")})
    }else{
      $scope.selectedPreds.splice(predPosition, 1);
    }
  }

  $scope.getData = function(){
    var n = $scope.selectedPreds.length;
    var params = {};
    args = "n="+n+"&class="+encodeURIComponent($scope.selectedClass);
    $.each($scope.selectedPreds, function(i, item){
      var key = "pred"+i,
          name = "name"+i;      
      args += "&"+ key+"="+encodeURIComponent(item.uri);
      args += "&"+ name+"="+encodeURIComponent(item.name);
    });
    var win = window.open("/csv?"+args, '_blank');
    win.focus();
  }
}]);