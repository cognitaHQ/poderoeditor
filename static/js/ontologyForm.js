var ontologyFormApp = angular.module('ontologyFormApp', []);

ontologyFormApp.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
}]);

ontologyFormApp.controller('ontologyFormList', ['$scope', '$http', '$compile', function($scope, $http, $compile){
	url = window.location;
	$scope.instance = {};
	var config = {headers:
		{
      'Accept': 'application/json'
    }
  };

  $scope.tripleGenerators = [];

  $scope.urlify = function(u){
   return u.toLowerCase().replace(/[^a-zA-Z0-9\-]+/g, '_');
 }
 $scope.uuid = function(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
});
 }

 $scope._createTextWidget = function(predicate, htmlElement){
  var formElement = document.createElement("p");
  var legend = document.createElement("label");
  legend.innerHTML = predicate;
  formElement.appendChild(legend);
  var aux = document.createElement('input');
  aux.type="text";
  var id = $scope.uuid();
  aux.setAttribute("id", id);
  aux.setAttribute("class", "form-control");
  aux.setAttribute("data-predicate", predicate);
  aux.setAttribute("ng-model", "instance."+$scope.urlify(predicate)+".value");
  $scope.instance[$scope.urlify(predicate)] = {"predicate": predicate}
  formElement.appendChild(aux);
  $compile(formElement)($scope);
  var parent = document.getElementById(htmlElement).appendChild(formElement);

  var _generator = {
    predicate: predicate,
    id:  id,
    f: function(id, p){
      return {s: $("#uri").val(), p: p, o: {value: $("#"+id).val(), type: "text"}};
    }

  }
  $scope.tripleGenerators.push(_generator);
}

$scope.identifier = "";
$scope.baseNamespace = function(){return baseNamespace+$scope.urlify($scope.identifier)}
$scope.letMeKnow = function(){
 msg = {uri: $("#uri").val(), triples: []};

 for(var i=0; i<$scope.tripleGenerators.length; i++){
  var thisGenerator = $scope.tripleGenerators[i];
  a = thisGenerator.f(thisGenerator.id, thisGenerator.predicate);
  msg.triples = msg.triples.concat(a);
 }
 console.log(msg);
 $http({url: '/create',
   data: msg,
   method: "POST",

 }).
 success(function(data, status, headers, config) {
  alert("OK");
}).
 error(function(data, status, headers, config) {
  alert("Error");
});
}
$("#uriLabel").attr("data-predicate", labelPredicate);
$http.get(url, config).success(function(data){
  $scope.formData = data.main;
  $scope.formData.forEach(function(datum){
    if(datum.widget.value != "http://cognita.io/poderoEditor/layoutOntology/HTMLInputTextWidget"){
      alert(datum.widget.value);
    }else{
      $scope._createTextWidget(datum.predicate.value, datum.htmlElement.value);
    }
  });
  var submit = document.createElement("submit");
  submit.type="submit";
  submit.setAttribute("class", "btn btn-primary");
  submit.innerHTML = submitLabel;
  submit.setAttribute("ng-click", "letMeKnow()");
  document.getElementById("myForm").appendChild(submit);
  $compile(submit)($scope);

});
}])