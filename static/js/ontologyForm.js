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
  if(cloned == true){
    divH.html(title+" <button class='btn btn-danger btn-xs remove-btn' data-subclass='"+subClass+"' id='"+buttonId+"' ng-click='removeThis($event)'>X</button>");
  }else{
    divH.html(title+" <button class='btn btn-default btn-xs clone-btn' data-subclass='"+subClass+"' id='"+buttonId+"' ng-click='cloneThis($event)'>+</button>");
  }
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

$scope.removeThis = function(event){
  var k = parseInt($(event.target).attr("data-generator-key"));
  $scope.tripleGenerators[k] = null;
  $(event.target).parent().parent().remove();
}

$scope.cloneThis = function(event){
  var x = $(event.target).attr("id");
  if($scope.widgetConfigs[x] != undefined){
      var _title = $scope.widgetConfigs[x].title,
          _predicate =  $scope.widgetConfigs[x].predicate,
          _elem = $scope.widgetConfigs[x].elem,
          _cls = $scope.widgetConfigs[x].cls,
          _value = $scope.widgetConfigs[x].thisValue;
    if($scope.widgetConfigs[x].type == "autocomplete"){
      $scope._createAutocompleteWidget(_predicate, _title, _elem, _cls, _value, true);
    }
    if($scope.widgetConfigs[x].type == "text"){
      $scope._createTextWidget(_predicate, _title, _elem, _cls, _value, true);
    }
  }
  x = $(event.target).parent().parent().attr("data-subclass");
  if(x != undefined && x != null){
    if($scope.subWidgetModels[x] != undefined){
      parentId = $(event.target).parent().parent().attr("id");
      var _id = $scope._createSubWidgetElement(parentId, $scope.subWidgetModels[x].title, $scope.subWidgetModels[x].cls, true);
      $scope.subWidgets[_id] = {
                                  title:$scope.subWidgetModels[x].title,
                                  id: $scope.uuid(),
                                  widgets: $scope.subWidgetModels[x].widgets,
                                  triples: [],
                                  generators: [],
                                  visited: false,
                                  cls: $scope.subWidgetModels[x].cls,
                                  anchor: $scope.subWidgetModels[x].anchor,
                                  fwdlink: $scope.subWidgetModels[x].fwdlink,
                                  revlink: $scope.subWidgetModels[x].revlink
                                };

      $scope.subWidgets[_id].generators = [];
      $.each($scope.subWidgets[_id].widgets, function(i, item){
        if(item.displayed == null || item.displayed.toLowerCase() != "false"){
          var aux = {
            type: item.type,
            predicate: item.predicate,
            title: item.title,
            cls: item.cls
          }
          var widgetId = $scope._getWidget(item.type, item.predicate, item.title, _id, item.cls, null, undefined);
        }
      });
    }
  }
  // if($scope.subWidgetsWidget[x] != undefined){
  //   alert("subwidget!");
  //   var cls = $(event.target).attr("data-subclass");
  //   console.log($scope.subWidgetsWidget[x]);
  //   var _id = $scope._crea teSubWidgetElement("myForm", cls);
  //   $.each($scope.subWidgetsWidget[x], function(i, item){
  //     $scope._getWidget(item.type, item.predicate, item.title, _id, item.cls, null, undefined);
  //   })
  // }else{
  //   console.log(x, $scope.subWidgetsWidget);
  // }

}

$scope._createAutocompleteWidget = function(predicate, title, htmlElement, cls, thisValue, cloned){
  var formElement = $("<p>");
  var legend = $("<label>");
  legend.html(title);
  var id = $scope.uuid();
  var myConfig = {
    placeholder: "",
    minimumInputLength: 1,
    ajax: { // instead of writing the function to execute the request we use Select2's convenient helper
        url: function(terms){return "/search/"+terms+"/"+predicate},
        params: { headers: {"Accept": "application/json"}},
        dataType: 'json',
        quietMillis: 450,
        id: function(item){return item.id.mirroredUri; },
        results: function (data, page) { return { results: data.main, more: false }; },
        cache: false
    },
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
  };
  if(cloned == false){
    var buttonId = $scope.uuid();
    legend.html(title+" <button class='btn btn-default btn-xs clone-btn' id='"+buttonId+"' ng-click='cloneThis($event)'>+</button>");
    $scope.widgetConfigs[buttonId] = {
      type: "autocomplete",
      predicate: predicate,
      title: title,
      cls: cls,
      elem: id,
      thisValue: thisValue,
      config: myConfig
    };
  }else if(cloned == true){
    var generatorIndex = $scope.tripleGenerators.length;
    legend.html(title+" <button class='btn btn-danger btn-xs remove-btn' data-generator-key='"+generatorIndex+"' ng-click='removeThis($event)'>X</button>");
  }else{
    legend.html(title);
    var buttonId = $scope.uuid();
    $scope.widgetConfigs[buttonId] = {
      type: "autocomplete",
      predicate: predicate,
      title: title,
      cls: cls,
      elem: id,
      thisValue: thisValue,
      config: myConfig
    };
  }
  legend.appendTo(formElement);
  var aux = $('<input>');
  aux.attr("id", id);
  aux.attr("type", "hidden");
  aux.attr("class", "form-control input-xlarge");
  aux.attr("data-predicate", predicate);
  aux.attr("ng-model", "instance[\""+id+"\"]");
  //$scope.instance[predicate] = {"predicate": predicate}
  aux.appendTo(formElement);
  $compile(formElement)($scope);
  if(cloned != true){
    var parent = formElement.appendTo("#"+htmlElement);
  }else{
    var p = $("#"+htmlElement).parent()
    formElement.insertAfter(p);
  }

  $("#"+id).select2(myConfig);
  // if(instanceData != null && instanceData[predicate] != undefined){
  //   $scope.instance[predicate] = instanceData[predicate][0];
  //   $("#"+id).select2("data", instanceData[predicate][0]) ;
  // }
  $scope.instance[id] = "";
  if(thisValue != null &&thisValue != undefined){
    $scope.instance[id] = thisValue;
    $("#"+id).select2('data', thisValue);
  }
  var _generator = {
    predicate: predicate,
    subject:  $("#uri").val(),
    object: $("#"+id).val(),
    objId: id,
    f: function(s, p, o){
      var obj = $("#"+o).select2("data");
      if(obj != "" && obj != undefined && obj != null){
        return [{s: {value: s, type: (s.indexOf("_:")==0)?"blank":"uri"}, p: p, o: {value: (obj.id.mirroredUri)?obj.id.mirroredUri:obj.id.value, type: "uri"}}];
      }else{
        return [];
      }
    }
  }


  if(cls != null){
    if(cloned == undefined){
      $("#"+id).attr("data-subwidget-generator-id", $scope.subWidgets[htmlElement].generators.length);
      $scope.subWidgets[htmlElement].generators.push(_generator);
    }else{
      if($scope.subWidgets[cls] == undefined){
        $scope.subWidgets[cls] = {generators: []};
      }
      $("#"+id).attr("data-subwidget-generator-id", $scope.subWidgets[htmlElement].generators.length);
      $scope.subWidgets[htmlElement].generators.push(_generator);
    }
  }else{
    $("#"+id).attr("data-widget-generator-id", $scope.tripleGenerators.length);
    $scope.tripleGenerators.push(_generator);
  }

  return id;
}



$scope._createCalendarWidget = function(predicate, title, htmlElement, cls, thisValue, cloned){
  var formElement = $("<p>");
  var legend = $("<label>");
  var id = $scope.uuid();
  legend.html(title);
  if(cloned == false){
    var buttonId = $scope.uuid();
    legend.html(title+" <button class='btn btn-default btn-xs clone-btn' id='"+buttonId+"' ng-click='cloneThis($event)'>+</button>");
    $scope.widgetConfigs[buttonId] = {
      type: "autocomplete",
      predicate: predicate,
      title: title,
      cls: cls,
      elem: id,
      thisValue: thisValue
    };
  }
  if(cloned == true){
    var generatorIndex = $scope.tripleGenerators.length;
    legend.html(title+" <button class='btn btn-danger btn-xs remove-btn' data-generator-key='"+generatorIndex+"' ng-click='removeThis($event)'>X</button>");
  }
  legend.appendTo(formElement);
  var aux = $('<input>');
  aux.attr("type", "text");
  aux.attr("id", id);
  aux.attr("class", "form-control");
  aux.attr("data-predicate", predicate);
  aux.attr("ng-model", "instance[\""+id+"\"]");
  $scope.instance[id] = (thisValue == null)?"":thisValue.id.value;
  aux.appendTo(formElement);
  $compile(formElement)($scope);
  formElement.appendTo($("#"+htmlElement));
  $("#"+id).datepicker({format: "yyyy-mm-dd", autoclose: true});
  if(instanceData != null && instanceData[id] != undefined){
    //$scope.instance[id] = instanceData[id][0];
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
    $("#"+id).attr("data-subwidget-generator-id", $scope.subWidgets[htmlElement].generators.length);
    $scope.subWidgets[htmlElement].generators.push(_generator);
  }else{
    $("#"+id).attr("data-widget-generator-id", $scope.tripleGenerators.length);
    $scope.tripleGenerators.push(_generator);
  }
  return id;
}

$scope._createTextWidget = function(predicate, title, htmlElement, cls, thisValue, cloned){
  var formElement = $("<p>");
  var legend = $("<label>");
  var id = $scope.uuid();
  legend.html(title);
  if(cloned != true){
    var buttonId = $scope.uuid();
    legend.html(title+" <button class='btn btn-default btn-xs clone-btn' id='"+buttonId+"' ng-click='cloneThis($event)'>+</button>");
    $scope.widgetConfigs[buttonId] = {
      type: "text",
      predicate: predicate,
      title: title,
      cls: cls,
      elem: id,
      thisValue: (thisValue != null)?thisValue.id.value:""
    };
  }else{
    var generatorIndex = $scope.tripleGenerators.length;
    legend.html(title+" <button class='btn btn-danger btn-xs remove-btn' data-generator-key='"+generatorIndex+"' ng-click='removeThis($event)'>X</button>");
  }
  legend.appendTo(formElement);
  var aux = $('<input>');
  aux.attr("type", "text");
  aux.attr("id", id);
  aux.attr("class", "form-control");
  aux.attr("data-predicate", predicate);
  aux.attr("ng-model", "instance[\""+id+"\"]");
  $scope.instance[id] = (thisValue == null)?"":thisValue.id.value;
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

$scope.identifier = uriLabel;
$scope.isUriNew = isUriNew;
var request = null;
$scope.checkIfUriExists = function(){
  var newUri = baseNamespace+$scope.urlify($scope.identifier);
  clearTimeout(request);
  request = setTimeout(function(){
    $http.get("/exists/"+newUri).success(function(data){
      $scope.isUriNew = !data.exists;
      if($scope.isUriNew == false){
        alert("Cambie el nombre, esa URIya existe");
      }
    });
  }, 1000);

}
$scope.baseNamespace = function(){
  // $.ajax({
  //   url: "/getUri/"+ baseNamespace+$scope.urlify($scope.identifier)
  // })
  var newUri = baseNamespace+$scope.urlify($scope.identifier);

  return (instanceData ==  null)?newUri:baseNamespace;

};
$scope.proceedDelete = function(){
 msg = {uri: $("#uri").val()};
 var submitUrl = '/editInstance';
 $http({url: submitUrl,
   data: msg,
   method: "POST",

 }).
 success(function(data, status, headers, config) {
  alert("Instance deleted");
  window.location = "/";
}).
 error(function(data, status, headers, config) {
  alert("Error");
});
};

$scope.letMeKnow = function(){
 if(! $scope.isUriNew){
  alert("Debe cambiar la etiqueta");
 }
 msg = {uri: $("#uri").val(), triples: []};
 msg.triples.push({s: {value: $("#uri").val(), type: "uri"}, p: labelPredicate, o: {value: $("#uriLabel").val(), type: "text"}});
 msg.triples.push({s: {value: $("#uri").val(), type: "uri"}, p: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", o: {value: uriClass, type: "uri"}});
 for(var i=0; i<$scope.tripleGenerators.length; i++){
  var thisGenerator = $scope.tripleGenerators[i];
  if(thisGenerator != null){
    a = thisGenerator.f($("#uri").val(), thisGenerator.predicate, thisGenerator.objId);
    msg.triples = msg.triples.concat(a);
  }
 }
 //Sub widgets
 for(var k in $scope.subWidgets){
  var subwidget = $scope.subWidgets[k];
  var blankNode = "_:b"+$scope.uuid();
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
$http({url: submitUrl,
 data: msg,
 method: "POST",

}).
success(function(data, status, headers, config) {
  if(thisUri == null){
    window.location = "/view/"+msg.uri;
  }else{
    window.location = "/view/"+thisUri;
  }
}).
error(function(data, status, headers, config) {
  alert("Error");
});
}

$("#uriLabel").attr("data-predicate", labelPredicate);
$scope.initForm = function(data){
  $scope.subWidgets = {};
  var currentSubwidget = null;
  $scope.formData = d.main;
  if(instanceData != null){
    $("#uriLabel").val(instanceData[labelPredicate][0].id);
  }


  $scope.formData.forEach(function(datum, i){
    var key = datum.sub_class.mirroredUri;
    if(key != null){
      var title = datum.sub_predicate.mirroredUri;
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
                                            predicate: datum.sub_predicate.mirroredUri,
                                            cls: datum.sub_class.value,
                                            displayed: datum.displayed,
                                            title:title,
                                            triples: []
                                          });
    }

  });


  $scope.formData.forEach(function(datum, i){
    var title = datum.predicate.mirroredUri;
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
             if(item.displayed == null || item.displayed.toLowerCase() != "false"){
                var values = entity.filter(function(d){return d.predicate == item.predicate}).pop();
                if(values == undefined){
                  var widgetId = $scope._getWidget(item.type, item.predicate, item.title, _id, item.cls, null, undefined);
                }else{
                  var widgetId = $scope._getWidget(item.type, item.predicate, item.title, _id, item.cls, values.obj, undefined);
                }
              }
            });
          })
          $scope.visitedSubWidgets[key] = true;
        }else{
          if($scope.visitedSubWidgets[key] == undefined){
            var _id = $scope._createSubWidgetElement($scope.subWidgetModels[key].anchor, title, $scope.subWidgetModels[key].cls);
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
            $scope.visitedSubWidgets[key] = true;
            $.each($scope.subWidgetModels[key].widgets, function(i, item){
                            
             if(item.displayed == null || item.displayed.toLowerCase() != "false"){
                            var aux = {
                type: item.type,
                predicate: item.predicate,
                title: item.title,
                cls: item.cls
              }
              var widgetId = $scope._getWidget(item.type, item.predicate, item.title, _id, item.cls, null, undefined);
          }
            });
          }
        }
      }else{
        alert("Error!");
      }
    }else{
      currentSubwidget = null;
      if(instanceData != null && instanceData[datum.predicate.mirroredUri] != undefined){
        var _elem = datum.htmlElement.value;
        for(var i=0; i < instanceData[datum.predicate.mirroredUri].length; i++){
          var thisValue = instanceData[datum.predicate.mirroredUri][i];
          _elem = $scope._getWidget(datum.widget.value, datum.predicate.mirroredUri, title, _elem, null, thisValue, (i==0)?false:true);
        }
      }else{
        $scope._getWidget(datum.widget.value, datum.predicate.mirroredUri, title, datum.htmlElement.value, null, null, false);
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