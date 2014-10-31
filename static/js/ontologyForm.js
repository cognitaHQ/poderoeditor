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

    $scope.urlify = function(u){
    	return u.toLowerCase().replace(/[^a-zA-Z0-9\-]+/g, '_');
    }

    $scope.identifier = "";
    $scope.baseNamespace = function(){return baseNamespace+$scope.urlify($scope.identifier)}
    $scope.avisa = function(){
    	msg = {};
    	$.each($("input"), function(i, item){
    		var p = $(item).attr("data-predicate");
    		var v = $(item).val();
    		if(msg[p] == undefined){
    			msg[p] = [];
    		}
    		msg[p].push(v);
    	} );

    	console.log(msg);
    	$http({url: '/create', 
    		   data: msg,
    		   method: "POST",

    		}).
  			success(function(data, status, headers, config) {
  				alert("OK");
  				console.log(data);
  				console.log(status);
  				console.log(headers);
  				console.log(config);
			}).
  			error(function(data, status, headers, config) {
  				alert("Error");
  				console.log(status);
			});
    }
    $("#uriLabel").attr("data-predicate", labelPredicate);
	$http.get(url, config).success(function(data){
		$scope.formData = data.main;
		$scope.formData.forEach(function(datum){
			var formElement = document.createElement("p");
			var legend = document.createElement("label");
			legend.innerHTML = datum.predicate.curie;
			formElement.appendChild(legend);
			var aux = document.createElement('input');
			aux.type="text";
			aux.id=datum.predicate.value;
			aux.setAttribute("class", "form-control");
			aux.setAttribute("data-predicate", datum.predicate.value);
			aux.setAttribute("ng-model", "instance."+$scope.urlify(datum.predicate.curie)+".value");
			$scope.instance[$scope.urlify(datum.predicate.curie)] = {"predicate": datum.predicate.curie}
			formElement.appendChild(aux);
			$compile(formElement)($scope);
  			var parent = document.getElementById(datum.htmlElement.value).appendChild(formElement);
		});
		var submit = document.createElement("submit");
		submit.type="submit";
		submit.setAttribute("class", "btn btn-primary");
		submit.innerHTML = submitLabel;
		submit.setAttribute("ng-click", "avisa()");
		document.getElementById("myForm").appendChild(submit);
		$compile(submit)($scope);

	});
}])