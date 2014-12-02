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

$scope._createAutocompleteWidget = function(predicate, htmlElement, cls){
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
    placeholder: "",
    minimumInputLength: 1,
    ajax: { // instead of writing the function to execute the request we use Select2's convenient helper
        url: function(terms){return "/search/"+terms+"/"+predicate},
        params: { headers: {"Accept": "application/json"}},
        dataType: 'json',
        quietMillis: 450,
        id: function(item){ return item.id.mirroredUri; },
        results: function (data, page) { return { results: data.main, more: false }; },
        cache: false
    },
    // initSelection: function(element, callback) {
    //     // the input tag has a value attribute preloaded that points to a preselected repository's id
    //     // this function resolves that id attribute to an object that select2 can render
    //     // using its formatResult renderer - that way the repository name is shown preselected
    //     var id = $(element).val();
    //     if (id !== "") {
    //         $.ajax("https://api.github.com/repositories/" + id, {
    //             dataType: "json"
    //         }).done(function(data) { callback(data); });
    //     }
    // },
    formatResult: function(item) {
      var markup =
      '<div class="row">' +
          '<div class="col-xs-10 col-sm-10 col-md-10 col-lg-10">' +
            '<div class="row">' +
               '<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">' + item.iLabel.value + '</div>' +
               '<div class="col-xs-3 col-sm-3 col-md-3 col-lg-3"><a href="' + item.id.mirroredUri + '">'+item.id.mirroredUri+'</a></div>' +
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
  if(instanceData != null && instanceData[predicate] != undefined){
    console.log(instanceData[predicate][0]);
    $scope.instance[predicate] = instanceData[predicate][0];
    $("#"+id).select2("data", instanceData[predicate][0]) ;
  }
  var _generator = {
    predicate: predicate,
    subject:  $("#uri").val(),
    object: $("#"+id).val(),
    objId: id,
    f: function(s, p, o){
      var obj = $("#"+o).select2("data");
      if(obj != "" && obj != undefined && obj != null){
        return [{s: {value: s, type: (s.indexOf("_:")==0)?"blank":"uri"}, p: p, o: {value: obj.id.mirroredUri, type: "uri"}}];
      }else{
        return [];
      }
    }
  }


  if(cls != null){
    if(entitiesData[cls] != undefined){
      for(var i in entitiesData[cls]){
        var connectionInstance = entitiesData[cls][i];
        for(var k=0; k<connectionInstance.length; k++){
          if(connectionInstance[k].predicate == predicate){
            $("#"+id).select2("data", {id: {value: connectionInstance[k].object}, iLabel: {value: connectionInstance[k].label } });//{id: {value: connectionInstance[k].object}, iLabel: {value: connectionInstance[k].label} });
            break;
          }
        }
      }
    }
    $scope.subWidgets[cls].generators.push(_generator);
  }else{
    $scope.tripleGenerators.push(_generator);
  }
}



$scope._createCalendarWidget = function(predicate, htmlElement, cls){
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
  $("#"+id).datepicker({format: "yyyy-mm-dd", autoclose: true});
  if(instanceData != null && instanceData[predicate] != undefined){
    $scope.instance[predicate] = instanceData[predicate][0];
  }

  var _generator = {
    predicate: predicate,
    subject:  $("#uri").val(),
    object: $("#"+id).val(),
    objId: id,
    f: function(s, p, o){
      var obj = $("#"+o).val();
      if(obj != "" && obj != undefined){
        return [{s: {value: s, type: (s.indexOf("_:")==0)?"blank":"uri"}, p: p, o: {value: obj, type: "date"}}];
      }else{
        return [];
      }
    }
  }

  if(cls != undefined){
    if(entitiesData[cls] != undefined){
      for(var i in entitiesData[cls]){
        var connectionInstance = entitiesData[cls][i];
        for(var k=0; k<connectionInstance.length; k++){
          if(connectionInstance[k].predicate == predicate){
        console.log(connectionInstance[k].object, predicate)
            $scope.instance[predicate] = connectionInstance[k].object;
            $("#"+id).datepicker('update', connectionInstance[k].object);
            break;
          }
        }
      }
    }
    $scope.subWidgets[cls].generators.push(_generator);
  }else{
    $scope.tripleGenerators.push(_generator);
  }
}

$scope._createTextWidget = function(predicate, htmlElement, cls){
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
    subject:  $("#uri").val(),
    object: $("#"+id).val(),
    objId: id,
    f: function(s, p, o){
      var obj = $("#"+o).val();
      if(obj != "" && obj != undefined){
        return [{s: {value: s, type: (s.indexOf("_:")==0)?"blank":"uri"}, p: p, o: {value: obj, type: "text"}}];
      }else{
        return [];
      }
    }
  }
  if(cls != undefined){
    if(entitiesData[cls] != undefined){
      for(var i in entitiesData[cls]){
        var connectionInstance = entitiesData[cls][i];
        for(var k=0; k<connectionInstance.length; k++){
          if(connectionInstance[k].predicate == predicate){
            $("#"+id).val(connectionInstance[k].object);
            break;
          }
        }
      }
    }
    $scope.subWidgets[cls].generators.push(_generator);
  }else{
    $scope.tripleGenerators.push(_generator);
  }
}

$scope.identifier = "";
$scope.baseNamespace = function(){
  // $.ajax({
  //   url: "/getUri/"+ baseNamespace+$scope.urlify($scope.identifier)
  // })
  return (instanceData ==  null)?baseNamespace+$scope.urlify($scope.identifier):baseNamespace;

};

$scope._getWidget = function(type, predicate, elem, cls){
  if(type == "http://cognita.io/poderoEditor/layoutOntology/HTMLInputTextWidget"){
      $scope._createTextWidget(predicate, elem);
    }else if(type == "http://cognita.io/poderoEditor/layoutOntology/HTMLInputDateWidget"){
      $scope._createCalendarWidget(predicate, elem, cls);
    }else{
      $scope._createAutocompleteWidget(predicate, elem, cls);
  }
}

$scope.letMeKnow = function(){
 msg = {uri: $("#uri").val(), triples: []};
 msg.triples.push({s: {value: $("#uri").val(), type: "uri"}, p: labelPredicate, o: {value: $("#uriLabel").val(), type: "text"}});
 msg.triples.push({s: {value: $("#uri").val(), type: "uri"}, p: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", o: {value: uriClass, type: "uri"}});
 for(var i=0; i<$scope.tripleGenerators.length; i++){
  var thisGenerator = $scope.tripleGenerators[i];
  a = thisGenerator.f($("#uri").val(), thisGenerator.predicate, thisGenerator.objId);
  msg.triples = msg.triples.concat(a);
 }
 //Sub widgets
 for(var k in $scope.subWidgets){
  var subwidget = $scope.subWidgets[k];
  var blankNode = "_:"+subwidget.id;
  if(subwidget.revlink != null){
    subwidget.triples.push({s: {value: blankNode, type: "blank"}, p: subwidget.revlink, o: {value: $("#uri").val(), type: "uri"}});
  }else{
    subwidget.triples.push({s: {value: $("#uri").val(), type: "uri"}, p: subwidget.fwdlink, o: {value: blankNode, type: "blank"}});
  }
  subwidget.triples.push({s: {value: blankNode, type: "blank"}, p: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", o: {value: subwidget.cls, type: "uri"}});
  for(var j=0; j < subwidget.generators.length; j++){
    var thisGenerator = subwidget.generators[j];
    //thisGenerator.subject = blankNode;
    //thisGenerator.objId = $("#"+thisGenerator.objId).val(),
    a = thisGenerator.f(blankNode, thisGenerator.predicate, thisGenerator.objId);
    subwidget.triples = subwidget.triples.concat(a);
  }
  if(subwidget.triples.length > 2){
    msg.triples = msg.triples.concat(subwidget.triples);
  }

 }
var submitUrl = (instanceData ==  null)?'/create':'/editInstance';
console.log(msg);
$http({url: submitUrl,
 data: msg,
 method: "POST",

}).
success(function(data, status, headers, config) {
  window.location = msg.uri.replace(baseNamespace, localNamespace);
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
    if(datum.sub_class.value != null){
        //it is a subwidget
        var subClass = datum.sub_class.value;
        if($scope.subWidgets[subClass] == undefined){
          var _id = $scope._createSubWidgetElement(datum.htmlElement.value, subClass);
          if(datum.super_predicate_forward.value != null){
            $scope.subWidgets[subClass] = {generators: [], id: _id, fwdlink: datum.super_predicate_forward.value, triples: [], cls: subClass};

          }
          if(datum.super_predicate_reverse.value != null){
            $scope.subWidgets[subClass] = {generators: [], id: _id, revlink: datum.super_predicate_reverse.value, triples: [], cls: subClass};
            //$scope.subWidgets[subClass].triples.push({s: $("#uri").val(), p: datum.super_predicate_reverse.value, o: {value: "_:"+_id, type: "blank"}})
          }
        }
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