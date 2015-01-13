var viewApp = angular.module('viewApp', []);

viewApp.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
}]);

viewApp.controller('viewList', ['$scope', '$http', '$compile', function($scope, $http, $compile){
	url = window.location;
	$scope.instance = {};
	var config = {headers:
		{
      'Accept': 'application/json'
    }
  };

  $scope.tripleGenerators = [];
  $scope.subWidgets = {};
  $scope.visitedSubWidgets = {};
  $scope.widgetConfigs = {};
  $scope.subWidgetModels = {};

  $scope.urlify = function(u){
   return u.toLowerCase().replace(/[^a-zA-Z0-9\-]+/g, '_');
 }
 $scope.uuid = function(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
 }

 $scope._getWidget = function(type, predicate, title, elem, cls, thisValue, cloned){
    var id = null;
    if(type == "http://cognita.io/poderoEditor/layoutOntology/HTMLInputTextWidget"){
      id = $scope._createTextWidget(predicate, title, elem, cls, thisValue, cloned);
    }else if(type == "http://cognita.io/poderoEditor/layoutOntology/HTMLInputDateWidget"){
      id = $scope._createCalendarWidget(predicate, title, elem, cls, thisValue, cloned);
    }else{
      id = $scope._createAutocompleteWidget(predicate, title, elem, cls, thisValue, cloned);
    }
    return id;
  }

 $scope._createSubWidgetElement = function(htmlElement, title, subClass, cloned){
  var identifier = $scope.uuid(),
      buttonId = $scope.uuid();
  var div = $("<div>");
  id = $scope.uuid();
  div.attr("id", id);
  div.attr("class", "panel panel-default");
  div.attr("data-subclass", subClass);
  var divH = $("<div>");
  divH.attr("class", "panel-heading");
  divH.html(title);
  var div2 = $("<div>");
  div2.attr("class", "panel-body subwidget");
  id = $scope.uuid();
  div2.attr("id", id);
  divH.appendTo(div);
  div2.appendTo(div);
  $compile(div)($scope);
  if(cloned == true){
    div.insertAfter($("#"+htmlElement));
  }else{
    div.appendTo($("#"+htmlElement));
  }
  return id;
 }


$scope._createAutocompleteWidget = function(predicate, title, htmlElement, cls, thisValue, cloned){
  var formElement = $("<p>");
  var legend = $("<label>");
  legend.html(title);
  var id = $scope.uuid();
  legend.html(title);
  var buttonId = $scope.uuid();
  legend.appendTo(formElement);
  var  aux = $('<p>');
  aux.attr("id", id);
  aux.appendTo(formElement);
  $compile(formElement)($scope);
  if(cloned != true){
    var parent = formElement.appendTo("#"+htmlElement);
  }else{
    var p = $("#"+htmlElement).parent()
    formElement.insertAfter(p);
  }

  if(thisValue != null){
    console.log(thisValue.iLabel.value)
    aux.html(thisValue.iLabel.value);
  }
  return id;
}



$scope._createCalendarWidget = function(predicate, title, htmlElement, cls, thisValue, cloned){
  var formElement = $("<p>");
  var legend = $("<label>");
  var id = $scope.uuid();
  legend.html(title+"A");  
  legend.appendTo($("#"+htmlElement));
  $compile(formElement)($scope);
  formElement.appendTo($("#"+htmlElement));
  if(thisValue != null){
    formElement.html(thisValue.id.value);
  }
  return id;
}

$scope._createTextWidget = function(predicate, title, htmlElement, cls, thisValue, cloned){
  var formElement = $("<p>");
  var legend = $("<label>");
  var id = $scope.uuid();
  legend.html(title);
  
  legend.appendTo(formElement);
  var aux = $('<p>');
  aux.attr("id", id);
  aux.html((thisValue == null)?"":thisValue.id);
  aux.appendTo(formElement);
  $compile(formElement)($scope);
  if(cloned != true){
    var parent = formElement.appendTo("#"+htmlElement);
  }else{
    var p = $("#"+htmlElement).parent();
    formElement.insertAfter(p);
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
    $("#"+id).attr("data-subwidget-generator-id", $scope.subWidgets[cls].generators.length);
    if(cloned == true){
      $scope.subWidgets[htmlElement].generators.push(_generator);
    }else{
      $scope.subWidgets[cls].generators.push(_generator);
    }
  }else{
    $("#"+id).attr("data-widget-generator-id", $scope.tripleGenerators.length);
    $scope.tripleGenerators.push(_generator);
  }
  return id;
}

$scope.identifier = "";
$scope.baseNamespace = function(){
  return (instanceData ==  null)?baseNamespace+$scope.urlify($scope.identifier):baseNamespace;

};

$("#uriLabel").attr("data-predicate", labelPredicate);
$scope.initForm = function(){
  $scope.subWidgets = {};
  var currentSubwidget = null;
  $scope.formData = d.main;
  if(instanceData != null){
    $("#uriLabel").val(instanceData[labelPredicate][0].id);
  }


  $scope.formData.forEach(function(datum, i){
    var key = datum.sub_class.value;
    if(key != null){
      var title = datum.sub_predicate.value;
      if(datum.predicatePreferedLabel && datum.predicatePreferedLabel.value){
        title = datum.predicatePreferedLabel.value;
      }else if(datum.predicateLabel && datum.predicateLabel.value){
        title = datum.predicateLabel.value;
      }
      if($scope.subWidgetModels[key] == undefined){
        $scope.subWidgetModels[key] = {
                                  title:title,
                                  id: $scope.uuid(),
                                  widgets: [],
                                  triples: [],
                                  generators: [],
                                  visited: false,
                                  cls: datum.sub_class.value,
                                  anchor: datum.htmlElement.value,
                                  fwdlink: datum.super_predicate_forward.value,
                                  revlink: datum.super_predicate_reverse.value
                                };
      }
      $scope.subWidgetModels[key].widgets.push({
                                            type: datum.sub_widget.value,
                                            predicate: datum.sub_predicate.value,
                                            cls: datum.sub_class.value,
                                            title:title,
                                            triples: []
                                          });
    }

  });


  $scope.formData.forEach(function(datum, i){
    var title = datum.predicate.value;
    if(datum.predicatePreferedLabel && datum.predicatePreferedLabel.value){
      title = datum.predicatePreferedLabel.value;
    }else if(datum.predicateLabel && datum.predicateLabel.value){
      title = datum.predicateLabel.value;
    }
    var key = datum.sub_class.value;
    if(key != null){
      if($scope.subWidgetModels[key] != null){
        if(entitiesData[key] != undefined && $scope.visitedSubWidgets[key] != true){
          //There is data related to this subwidget
          $.each(entitiesData[key], function(j, entity){
            var _id = $scope._createSubWidgetElement($scope.subWidgetModels[key].anchor, $scope.subWidgetModels[key].title, $scope.subWidgetModels[key].cls, false);
            $scope.visitedSubWidgets[key] = true;
            if($scope.subWidgets[_id] == undefined){
              $scope.subWidgets[_id] = {
                                  title:title,
                                  id: $scope.uuid(),
                                  widgets: [],
                                  triples: [],
                                  generators: [],
                                  visited: false,
                                  cls: datum.sub_class.value,
                                  anchor: datum.htmlElement.value,
                                  fwdlink: datum.super_predicate_forward.value,
                                  revlink: datum.super_predicate_reverse.value
                                };
            }
            $.each($scope.subWidgetModels[key].widgets, function(i, item){
              var values = entity.filter(function(d){return d.predicate == item.predicate}).pop();
              if(values == undefined){
                var widgetId = $scope._getWidget(item.type, item.predicate, title, _id, item.cls, null, undefined);
              }else{
                var widgetId = $scope._getWidget(item.type, item.predicate, title, _id, item.cls, values.obj, undefined);
              }
            });
          })
          $scope.visitedSubWidgets[key] = true;
        }
      }else{
        alert("Error!");
      }
    }else{
      currentSubwidget = null;
      if(instanceData != null && instanceData[datum.predicate.value] != undefined){
        var _elem = datum.htmlElement.value;
        for(var i=0; i < instanceData[datum.predicate.value].length; i++){
          var thisValue = instanceData[datum.predicate.value][i];
          _elem = $scope._getWidget(datum.widget.value, datum.predicate.value, title, _elem, null, thisValue, (i==0)?false:true);
        }
      }
    }
  });

  // var submit = document.createElement("submit");
  // submit.type="submit";
  // submit.setAttribute("class", "btn btn-primary");
  // submit.innerHTML = submitLabel;
  // submit.setAttribute("ng-click", "letMeKnow()");
  // document.getElementById("myForm").appendChild(submit);

  // if(deleteLabel != null){
  //   var deleteButton = document.createElement("deleteButton");
  //   deleteButton.type="deleteButton";
  //   deleteButton.setAttribute("class", "btn btn-danger");
  //   deleteButton.innerHTML = deleteLabel || "delete";
  //   deleteButton.setAttribute("ng-click", "deleteInstance()");
  //   document.getElementById("myForm").appendChild(deleteButton);
  // }

//  $compile(submit)($scope);

}
$scope.initForm();
}])