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

$scope._createAutocompleteWidget = function(predicate, htmlElement){
  var formElement = document.createElement("p");
  var legend = document.createElement("label");
  legend.innerHTML = predicate;
  formElement.appendChild(legend);
  var aux = document.createElement('input');
  var id = $scope.uuid();
  aux.setAttribute("id", id);
  aux.setAttribute("type", "hidden");
  aux.setAttribute("class", "form-control input-xlarge");
  aux.setAttribute("data-predicate", predicate);
  aux.setAttribute("ng-model", "instance."+$scope.urlify(predicate)+".value");
  $scope.instance[$scope.urlify(predicate)] = {"predicate": predicate}
  formElement.appendChild(aux);
  $compile(formElement)($scope);
  var parent = document.getElementById(htmlElement).appendChild(formElement);
  $("#"+id).select2({
    placeholder: "Search for a person, company or organization",
    minimumInputLength: 1,
    ajax: { // instead of writing the function to execute the request we use Select2's convenient helper
        url: function(terms){return "/search/"+terms},
        params: { headers: {"Accept": "application/json"}},
        dataType: 'json',
        quietMillis: 450,
        id: function(item){ console.log(item);return item.id.value; },
        results: function (data, page) { return { results: data.main, more: false }; },
        cache: false
    },
    initSelection: function(element, callback) {
        // the input tag has a value attribute preloaded that points to a preselected repository's id
        // this function resolves that id attribute to an object that select2 can render
        // using its formatResult renderer - that way the repository name is shown preselected        
        var id = $(element).val();
        if (id !== "") {
            $.ajax("https://api.github.com/repositories/" + id, {
                dataType: "json"
            }).done(function(data) { callback(data); });
        }
    },
    formatResult: function(item) {
      var markup = 
      '<div class="row">' +
          '<div class="col-xs-10 col-sm-10 col-md-10 col-lg-10">' +
            '<div class="row">' +
               '<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">' + item.iLabel.value + '</div>' +
               '<div class="col-xs-3 col-sm-3 col-md-3 col-lg-3"><a href="' + item.id.value + '">'+item.id.value+'</a></div>' +
            '</div>'+
          '</div>';

      return markup;
    }, // omitted for brevity, see the source of this page
    formatSelection: function(item) {      
      return item.iLabel.value;
    },
    dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
    escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
});
  var _generator = {
    predicate: predicate,
    id:  id,
    f: function(id, p){
      var data = $("#"+id).select2("data");
      if(data != undefined && data.id.mirroredUri != undefined){
        return [{s: $("#uri").val(), p: p, o: {value: data.id.mirroredUri, type: "uri"}}] ;
      }else{
        return [];
      }
    }

  }
  $scope.tripleGenerators.push(_generator);
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
      if($("#"+id).val() != "" && $("#"+id).val() != undefined){ 
        return [{s: $("#uri").val(), p: p, o: {value: $("#"+id).val(), type: "text"}}];
      }else{
        return [];
      }
    }

  }
  $scope.tripleGenerators.push(_generator);
}

$scope.identifier = "";
$scope.baseNamespace = function(){return baseNamespace+$scope.urlify($scope.identifier)}
$scope.letMeKnow = function(){
 msg = {uri: $("#uri").val(), triples: []};
 msg.triples.push({s: $("#uri").val(), p: labelPredicate, o: {value: $("#uriLabel").val(), type: "text"}});
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
      $scope._createAutocompleteWidget(datum.predicate.value, datum.htmlElement.value);
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