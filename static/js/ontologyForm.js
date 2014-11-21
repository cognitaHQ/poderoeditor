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
  $scope.subWidgets = {};

  $scope.urlify = function(u){
   return u.toLowerCase().replace(/[^a-zA-Z0-9\-]+/g, '_');
 }
 $scope.uuid = function(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}
$scope._createSubWidgetElement = function(htmlElement, subClass){
  var id = $scope.uuid();
  var div = document.createElement("div");
  div.setAttribute("class", "panel panel-default");
  var divH = document.createElement("div");
  divH.setAttribute("class", "panel-heading");
  divH.innerHTML= subClass;
  var div2 = document.createElement("div");
  div2.setAttribute("class", "panel-body");
  div2.setAttribute("id", id);
  div.appendChild(divH);
  div.appendChild(div2);
  $compile(div)($scope);
  document.getElementById(htmlElement).appendChild(div);
  return id;
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
  $scope.instance[predicate] = {"predicate": predicate}
  formElement.appendChild(aux);
  $compile(formElement)($scope);
  var parent = document.getElementById(htmlElement).appendChild(formElement);
  $("#"+id).select2({
    placeholder: "Search for a person, company or organization",
    minimumInputLength: 1,
    ajax: { // instead of writing the function to execute the request we use Select2's convenient helper
        url: function(terms){return "/search/"+terms+"/"+predicate},
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


$scope._createCalendarWidget = function(predicate, htmlElement){
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
  aux.setAttribute("ng-model", "instance[\""+predicate+"\"]");
  $scope.instance[predicate] = "";//{"predicate": predicate}
  formElement.appendChild(aux);
  $compile(formElement)($scope);
  var parent = document.getElementById(htmlElement).appendChild(formElement);
  $("#"+id).datepicker({format: "yyyy-mm-dd"});
  if(instanceData != null && instanceData[predicate] != undefined){
    $scope.instance[predicate] = instanceData[predicate][0];
  }

  var _generator = {
    predicate: predicate,
    id:  id,
    f: function(id, p){
      if($("#"+id).val() != "" && $("#"+id).val() != undefined){
        return [{s: $("#uri").val(), p: p, o: {value: $("#"+id).val(), type: "date"}}];
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
  aux.setAttribute("ng-model", "instance[\""+predicate+"\"]");
  $scope.instance[predicate] = "";//{"predicate": predicate}
  formElement.appendChild(aux);
  $compile(formElement)($scope);
  var parent = document.getElementById(htmlElement).appendChild(formElement);
  if(instanceData != null && instanceData[predicate] != undefined){
    $scope.instance[predicate] = instanceData[predicate][0];
  }

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
$scope.baseNamespace = function(){
  // $.ajax({
  //   url: "/getUri/"+ baseNamespace+$scope.urlify($scope.identifier)
  // })
  return (instanceData ==  null)?baseNamespace+$scope.urlify($scope.identifier):baseNamespace;

};

$scope._getWidget = function(type, predicate, elem, cls){
  console.log(type, predicate, elem);
  if(type == "http://cognita.io/poderoEditor/layoutOntology/HTMLInputTextWidget"){
      $scope._createTextWidget(predicate, elem);
    }else if(type == "http://cognita.io/poderoEditor/layoutOntology/HTMLInputDateWidget"){
      $scope._createCalendarWidget(predicate, elem);
    }else{
      $scope._createAutocompleteWidget(predicate, elem);
  }
}

$scope.letMeKnow = function(){
 msg = {uri: $("#uri").val(), triples: []};
 msg.triples.push({s: $("#uri").val(), p: labelPredicate, o: {value: $("#uriLabel").val(), type: "text"}});
 msg.triples.push({s: $("#uri").val(), p: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", o: {value: uriClass, type: "uri"}});
 for(var i=0; i<$scope.tripleGenerators.length; i++){
  var thisGenerator = $scope.tripleGenerators[i];
  a = thisGenerator.f(thisGenerator.id, thisGenerator.predicate);
  msg.triples = msg.triples.concat(a);
}
var submitUrl = (instanceData ==  null)?'/create':'/editInstance';
$http({url: submitUrl,
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
  console.log($scope.formData);
  if(instanceData != null){
    $("#uriLabel").val(instanceData[labelPredicate][0]);
  }
  $scope.formData.forEach(function(datum){
    if(datum.sub_class.value != null){
        var subClass = datum.sub_class.value;
        if($scope.subWidgets[subClass] == undefined){
          var _id = $scope._createSubWidgetElement(datum.htmlElement.value, subClass);
          $scope.subWidgets[subClass] = {widgets: [], id: _id};
        }
        console.log(datum.sub_widget.value, datum.sub_predicate.value, $scope.subWidgets[subClass].id, subClass);
        $scope._getWidget(datum.sub_widget.value, datum.sub_predicate.value, $scope.subWidgets[subClass].id, subClass);
    }else{
        $scope._getWidget(datum.widget.value, datum.predicate.value, datum.htmlElement.value);
    }
  });


  var submit = document.createElement("submit");
  submit.type="submit";
  submit.setAttribute("class", "btn btn-primary");
  submit.innerHTML = submitLabel;
  submit.setAttribute("ng-click", "letMeKnow()");
  document.getElementById("myForm").appendChild(submit);

  if(deleteLabel != null){
    var deleteButton = document.createElement("deleteButton");
    deleteButton.type="deleteButton";
    deleteButton.setAttribute("class", "btn btn-danger");
    deleteButton.innerHTML = deleteLabel || "delete";
    deleteButton.setAttribute("ng-click", "deleteInstance()");
    document.getElementById("myForm").appendChild(deleteButton);
  }

  $compile(submit)($scope);

});
}])