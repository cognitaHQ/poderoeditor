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
  $scope.widgetConfigs = {}
  $scope.urlify = function(u){
   return u.toLowerCase().replace(/[^a-zA-Z0-9\-]+/g, '_');
 }
 $scope.uuid = function(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
 }

 $scope._getWidget = function(type, predicate, title, elem, cls, thisValue){
    var id = null;
    if(type == "http://cognita.io/poderoEditor/layoutOntology/HTMLInputTextWidget"){
      id = $scope._createTextWidget(predicate, title, elem, null, thisValue);
    }else if(type == "http://cognita.io/poderoEditor/layoutOntology/HTMLInputDateWidget"){
      id = $scope._createCalendarWidget(predicate, title, elem, cls, thisValue);
    }else{
      id = $scope._createAutocompleteWidget(predicate, title, elem, cls, thisValue, false);
    }
    return id;
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

$scope.removeThis = function(event){
  var k = parseInt($(event.target).attr("data-generator-key"));
  $scope.tripleGenerators[k] = null;
  $(event.target).parent().parent().remove();
}

$scope.cloneThis = function(event){
  var x = $(event.target).attr("id");
  if($scope.widgetConfigs[x] != undefined){
    if($scope.widgetConfigs[x].type == "autocomplete"){
      var _title = $scope.widgetConfigs[x].title,
          _predicate =  $scope.widgetConfigs[x].predicate,
          _elem = $scope.widgetConfigs[x].elem,
          _cls = $scope.widgetConfigs[x].cls,
          _value = $scope.widgetConfigs[x].thisValue;
      $scope._createAutocompleteWidget(_predicate, _title, _elem, _cls, _value, true);
    }


  }
}

$scope._createAutocompleteWidget = function(predicate, title, htmlElement, cls, thisValue, cloned){
  var formElement = $("<p>");
  var legend = $("<label>");
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
  }else{
    var generatorIndex = $scope.tripleGenerators.length;
    legend.html(title+" <button class='btn btn-danger btn-xs remove-btn' data-generator-key='"+generatorIndex+"' ng-click='removeThis($event)'>X</button>");
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
  if(cloned == false){
    var parent = formElement.appendTo("#"+htmlElement);
  }else{
    formElement.insertAfter("#"+htmlElement);
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
    //console.log($scope.subWidgets[cls]);
    if($scope.subWidgets[cls] == undefined){
      $scope.subWidgets[cls] = {generators: []};
    }
    $("#"+id).attr("data-subwidget-generator-id", $scope.subWidgets[cls].generators.length);
    $scope.subWidgets[cls].generators.push(_generator);
  }else{
    $("#"+id).attr("data-widget-generator-id", $scope.tripleGenerators.length);
    $scope.tripleGenerators.push(_generator);
  }

  return id;
}



$scope._createCalendarWidget = function(predicate, title, htmlElement, cls, thisValue){
  var formElement = document.createElement("p");
  var legend = document.createElement("label");
  legend.innerHTML = title;
  formElement.appendChild(legend);
  var aux = document.createElement('input');
  aux.type="text";
  var id = $scope.uuid();
  aux.setAttribute("id", id);
  aux.setAttribute("class", "form-control");
  aux.setAttribute("data-predicate", predicate);
  aux.setAttribute("ng-model", "instance[\""+id+"\"]");
  $scope.instance[id] = (thisValue == null)?"":thisValue.id.value;
  formElement.appendChild(aux);
  $compile(formElement)($scope);
  var parent = document.getElementById(htmlElement).appendChild(formElement);
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
    $("#"+id).attr("data-subwidget-generator-id", $scope.subWidgets[cls].generators.length);
    $scope.subWidgets[cls].generators.push(_generator);
  }else{
    $("#"+id).attr("data-widget-generator-id", $scope.tripleGenerators.length);
    $scope.tripleGenerators.push(_generator);
  }
  return id;
}

$scope._createTextWidget = function(predicate, title, htmlElement, cls, thisValue){
  var formElement = document.createElement("p");
  var legend = document.createElement("label");
  legend.innerHTML = title;
  formElement.appendChild(legend);
  var aux = document.createElement('input');
  aux.type="text";
  var id = $scope.uuid();
  aux.setAttribute("id", id);
  aux.setAttribute("class", "form-control");
  aux.setAttribute("data-predicate", predicate);
  aux.setAttribute("ng-model", "instance[\""+id+"\"]");
  $scope.instance[id] = (thisValue == null)?"":thisValue.id;
  formElement.appendChild(aux);
  $compile(formElement)($scope);
  var parent = document.getElementById(htmlElement).appendChild(formElement);

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
    $scope.subWidgets[cls].generators.push(_generator);
  }else{
    $("#"+id).attr("data-widget-generator-id", $scope.tripleGenerators.length);
    $scope.tripleGenerators.push(_generator);
  }
  return id;
}

$scope.identifier = "";
$scope.baseNamespace = function(){
  // $.ajax({
  //   url: "/getUri/"+ baseNamespace+$scope.urlify($scope.identifier)
  // })
  return (instanceData ==  null)?baseNamespace+$scope.urlify($scope.identifier):baseNamespace;

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
  if(thisUri == null){
    window.location = msg.uri.replace(baseNamespace, localNamespace);
  }else{
    window.location = thisUri.replace(baseNamespace, localNamespace);
  }
}).
error(function(data, status, headers, config) {
  alert("Error");
});
}

$("#uriLabel").attr("data-predicate", labelPredicate);
$http.get(url, config).success(function(data){
  $scope.subWidgets = {};
  var currentSubwidget = null;
  $scope.formData = data.main;
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
      if($scope.subWidgets[key] == undefined){
        $scope.subWidgets[key] = {
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
      $scope.subWidgets[key].widgets.push({
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
      if($scope.subWidgets[key] != null){
        if(entitiesData[key] != undefined && $scope.subWidgets[key].visited != true){
          $.each(entitiesData[key], function(j, entity){
            var _id = $scope._createSubWidgetElement($scope.subWidgets[key].anchor, $scope.subWidgets[key].title, $scope.subWidgets[key].subClass);
            $scope.subWidgets[key].visited = true;
            $.each($scope.subWidgets[key].widgets, function(i, item){
              var values = entity.filter(function(d){return d.predicate == item.predicate}).pop();
              if(values == undefined){
                var widgetId = $scope._getWidget(item.type, item.predicate, title, _id, item.cls);
              }else{
                var widgetId = $scope._getWidget(item.type, item.predicate, title, _id, item.cls, values.obj);
              }
            });
          })
          // for(var i in entitiesData[key]){
          //   d = entitiesData[key][i];
          //   var _id = $scope._createSubWidgetElement($scope.subWidgets[key].anchor, $scope.subWidgets[key].title, $scope.subWidgets[key].subClass, d);
          // }
          $scope.subWidgets[key].visited = true;
        }else{
          if($scope.subWidgets[key].visited != true){
            var _id = $scope._createSubWidgetElement($scope.subWidgets[key].anchor, title, $scope.subWidgets[key].subClass);
            $scope.subWidgets[key].visited = true;
            $.each($scope.subWidgets[key].widgets, function(i, item){
              var widgetId = $scope._getWidget(item.type, item.predicate, item.title, _id, item.cls);
            });
          }
        }
      }else{
        alert("Error!");
      }
      // //it is a subwidget
      // var subClass = datum.sub_class.value;
      // var _id = null;
      // //Check if data structures for this subwidget exist
      // //Check if the data for this subwidget exist
      //   if($scope.subWidgets[subClass] == undefined){
      //     if(datum.super_predicate_forward.value != null){
      //       _id = $scope._createSubWidgetElement(datum.htmlElement.value, title, subClass);
      //       $scope.subWidgets[subClass] = {generators: [], id: _id, fwdlink: datum.super_predicate_forward.value, triples: [], cls: subClass};
      //     }
      //     if(datum.super_predicate_reverse.value != null){
      //       _id = $scope._createSubWidgetElement(datum.htmlElement.value, title, subClass);
      //       $scope.subWidgets[subClass] = {generators: [], id: _id, revlink: datum.super_predicate_reverse.value, triples: [], cls: subClass};
      //     }
      //   }else{
      //     _id = $scope.subWidgets[subClass].id;
      //   }
      //   if(repeatedSubWidgets[subClass] == undefined){
      //     repeatedSubWidgets[subClass] = {};
      //   }
      //   var widgetId = $scope._getWidget(datum.sub_widget.value, datum.sub_predicate.value, title, $scope.subWidgets[subClass].id, subClass);
      //   repeatedSubWidgets[subClass][widgetId] = datum.sub_predicate.value;
      // // var subClass = datum.sub_class.value;
      // // if($scope.subWidgets[subClass] == undefined){
      // //   var _id = $scope._createSubWidgetElement(datum.htmlElement.value, title, subClass);
      // //   if(datum.super_predicate_forward.value != null){
      // //     $scope.subWidgets[subClass] = {generators: [], id: _id, fwdlink: datum.super_predicate_forward.value, triples: [], cls: subClass};
      // //   }
      // //   if(datum.super_predicate_reverse.value != null){
      // //     $scope.subWidgets[subClass] = {generators: [], id: _id, revlink: datum.super_predicate_reverse.value, triples: [], cls: subClass};
      // //     //$scope.subWidgets[subClass].triples.push({s: $("#uri").val(), p: datum.super_predicate_reverse.value, o: {value: "_:"+_id, type: "blank"}})
      // //   }
      // // }
    }else{
      currentSubwidget = null;
      if(instanceData != null && instanceData[datum.predicate.value] != undefined){
        for(var i=0; i < instanceData[datum.predicate.value].length; i++){
          var thisValue = instanceData[datum.predicate.value][i];
          $scope._getWidget(datum.widget.value, datum.predicate.value, title, datum.htmlElement.value, null, thisValue);
        }
      }else{
        $scope._getWidget(datum.widget.value, datum.predicate.value, title, datum.htmlElement.value);
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

});
}])