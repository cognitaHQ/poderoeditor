var layoutFormApp = angular.module('layoutFormApp', []);

layoutFormApp.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
}]);

layoutFormApp.controller('layoutFormList', ['$scope', '$http', '$compile', function($scope, $http, $compile){
	url = window.location;
	$scope.widgets = {};
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
  var miniTable = document.createElement("table");
  dminiTableiv.setAttribute("class", "table table-bordered table-hover");
  var miniTableH = document.createElement("thead");
  var miniTableTh = document.createElement("th");

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


$scope.identifier = "";
$scope.baseNamespace = function(){
  // $.ajax({
  //   url: "/getUri/"+ baseNamespace+$scope.urlify($scope.identifier)
  // })
  return (instanceData ==  null)?baseNamespace+$scope.urlify($scope.identifier):baseNamespace;

};

$scope._getWidget = function(type, name, predicate, position, available, elem, cls){
  $scope.widgets[predicate] = {};
  var formElement = document.createElement("tr");
  var legendTd = document.createElement("td");
  var auxLabel = document.createElement("p");
  auxLabel.setAttribute("class", "");
  auxLabel.innerHTML = predicate;
  var aux3 = document.createElement("input");
  aux3.type="text"
  aux3.setAttribute("id", $scope.uuid());
  aux3.setAttribute("class","form-control");
  aux3.setAttribute("ng-model", "widgets[\""+predicate+"\"].name");
  legendTd.appendChild(aux3);
  legendTd.appendChild(auxLabel);
  formElement.appendChild(legendTd);


  var availabilityTd = document.createElement("td");
  availabilityTd.setAttribute("class", "text-center");
  var aux = document.createElement('input');
  aux.type="checkbox";
  var idAvailable = $scope.uuid();
  aux.setAttribute("id", idAvailable);
  //aux.setAttribute("class", "form-control");
  aux.setAttribute("data-predicate", predicate);
  aux.setAttribute("ng-model", "widgets[\""+predicate+"\"].availability");
  availabilityTd.appendChild(aux);
  formElement.appendChild(availabilityTd);

  var positionTd = document.createElement("td");
  var aux2 = document.createElement('input');
  aux2.type="number";
  var idNumber = $scope.uuid();
  aux2.setAttribute("id", idNumber);
  //aux2.setAttribute("value", position);
  aux2.setAttribute("ng-model", "widgets[\""+predicate+"\"].position");
  positionTd.appendChild(aux2);
  formElement.appendChild(positionTd);

  $compile(formElement)($scope);
  var parent = document.getElementById(elem).appendChild(formElement);
  $scope.widgets[predicate].availability = available;
  $scope.widgets[predicate].name = name;
  $scope.widgets[predicate].position = parseInt(position);
  $scope.widgets[predicate].type = type;
  return;

}

$scope.letMeKnow = function(){
  msg = {widgetClass: uriClass, bnodes: []};
  for(var predicate in $scope.widgets){
    var obj = $scope.widgets[predicate];
    bnode = [];
    bnode.push({p: "http://cognita.io/poderoEditor/layoutOntology/predicateDisplayed", o: {value: predicate, type: "uri"}});
    bnode.push({p: "http://cognita.io/poderoEditor/layoutOntology/positionNumber", o: {value: obj.position, type: "number"}});
    bnode.push({p: "http://cognita.io/poderoEditor/layoutOntology/anchoredTo", o: {value: "myForm", type: "text"}});
    bnode.push({p: "http://cognita.io/poderoEditor/layoutOntology/displayWidget", o: {value: obj.availability, type: "boolean"}});
    bnode.push({p: "http://www.w3.org/2004/02/skos/core#prefLabel", o: {value: obj.name, type: "text", lang: labelLanguage}});
    bnode.push({p: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", o: {value: obj.type, type: "uri"}});
    msg.bnodes.push(bnode);
  }
 //Sub widgets
 // for(var k in $scope.subWidgets){
 //  var subwidget = $scope.subWidgets[k];
 //  var blankNode = "_:"+subwidget.id;
 //  if(subwidget.revlink != null){
 //    subwidget.triples.push({s: {value: blankNode, type: "blank"}, p: subwidget.revlink, o: {value: $("#uri").val(), type: "uri"}});
 //  }else{
 //    subwidget.triples.push({s: {value: $("#uri").val(), type: "uri"}, p: subwidget.fwdlink, o: {value: blankNode, type: "blank"}});
 //  }
 //  subwidget.triples.push({s: {value: blankNode, type: "blank"}, p: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", o: {value: subwidget.cls, type: "uri"}});
 //  for(var j=0; j < subwidget.generators.length; j++){
 //    var thisGenerator = subwidget.generators[j];
 //    //thisGenerator.subject = blankNode;
 //    //thisGenerator.objId = $("#"+thisGenerator.objId).val(),
 //    a = thisGenerator.f(blankNode, thisGenerator.predicate, thisGenerator.objId);
 //    subwidget.triples = subwidget.triples.concat(a);
 //  }
 //  if(subwidget.triples.length > 2){
 //    msg.triples = msg.triples.concat(subwidget.triples);
 //  }

 // }
var submitUrl = '/editLayout';
$http({url: submitUrl,
 data: msg,
 method: "POST",

}).
success(function(data, status, headers, config) {
  location.reload();
}).
error(function(data, status, headers, config) {
  alert("Error");
});
}

$("#uriLabel").attr("data-predicate", labelPredicate);
$http.get(url, config).success(function(data){
  $scope.formData = data.main;
  if(instanceData != null){
    $("#uriLabel").val(instanceData[labelPredicate][0]);
  }
  $scope.formData.forEach(function(datum){
    // if(datum.sub_class.value != null){
    //     //it is a subwidget
    //     var subClass = datum.sub_class.value;
    //     if($scope.subWidgets[subClass] == undefined){
    //       var _id = $scope._createSubWidgetElement(datum.htmlElement.value, subClass);
    //       if(datum.super_predicate_forward.value != null){
    //         $scope.subWidgets[subClass] = {generators: [], id: _id, fwdlink: datum.super_predicate_forward.value, triples: [], cls: subClass};

    //       }
    //       if(datum.super_predicate_reverse.value != null){
    //         $scope.subWidgets[subClass] = {generators: [], id: _id, revlink: datum.super_predicate_reverse.value, triples: [], cls: subClass};
    //         //$scope.subWidgets[subClass].triples.push({s: $("#uri").val(), p: datum.super_predicate_reverse.value, o: {value: "_:"+_id, type: "blank"}})
    //       }
    //     }
    //     $scope._getWidget(datum.sub_widget.value, datum.sub_predicate.value, $scope.subWidgets[subClass].id, subClass);
    // }else{
        var propertyName = datum.predicate.value;
        if(datum.prefLabel != null && datum.prefLabel != undefined && datum.prefLabel.value != "" && datum.prefLabel.value != null){
          propertyName = datum.prefLabel.value;
        }
        var propertyDisplay = true;
        if(datum.displayed != null && datum.displayed != undefined && datum.displayed.value != undefined && datum.displayed.value != null && (datum.displayed.value.toLowerCase() === "false" || datum.displayed.value === "0")){
          propertyDisplay = false;
        }
        $scope._getWidget(datum.widget.value, propertyName, datum.predicate.value, datum.position.value, propertyDisplay, datum.htmlElement.value);
    //}
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