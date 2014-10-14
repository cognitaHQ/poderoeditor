var ontologyFormApp = angular.module('ontologyFormApp', []);

ontologyFormApp.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
}]);

ontologyFormApp.controller('ontologyFormList', ['$scope', '$http', function($scope, $http){	
	url = window.location;
	var config = {headers:  
		{
        'Accept': 'application/json'
    	}
    };

	$http.get(url, config).success(function(data){
		$scope.formData = data.main;

//		$scope.formData = data;
//		console.log(data);
		$scope.formData.forEach(function(datum){
			var formElement = document.createElement("p");
			var legend = document.createElement("legend");
			legend.innerHTML = datum.predicate.curie;
			formElement.appendChild(legend);
			var aux = document.createElement('input');
			aux.type="text";
			aux.id=datum.predicate.value;
			aux.setAttribute("data-predicate", datum.predicate.value);
			formElement.appendChild(aux);
  			var parent = document.getElementById(datum.htmlElement.value).appendChild(formElement);
		});
		var submit = document.createElement("submit");
		submit.type="submit";
		submit.setAttribute("class", "btn btn-primary");
		submit.innerHTML = "Submit";
		document.getElementById("myForm").appendChild(submit);

	});
}])