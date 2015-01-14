var layoutFormApp = angular.module('layoutFormApp', []);

layoutFormApp.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
}]);

layoutFormApp.controller('layoutFormList', ['$scope', '$http', '$compile', function($scope, $http, $compile){
	url = window.location;
  $scope.identifier = "";
	$scope.widgets = {};
  $scope.subwidgets = {};

  var config = {headers:
		{
      'Accept': 'application/json'
    }
  };

  $scope.urlify = function(u){
   return u.toLowerCase().replace(/[^a-zA-Z0-9\-]+/g, '_');
  }

  $scope.uuid = function(){
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
   });
  }

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

  $scope._getSubWidget = function(name, subClass, position, available, elem){
    var key = subClass;
    $scope.subwidgets[key] = {};
    var formElement = document.createElement("tr");
    var legendTd = document.createElement("td");
    var auxLabel = document.createElement("p");
    auxLabel.setAttribute("class", "");
    auxLabel.innerHTML = subClass;
    var aux3 = document.createElement("input");
    aux3.type="text"
    aux3.setAttribute("id", $scope.uuid());
    aux3.setAttribute("class","form-control");
    aux3.setAttribute("ng-model", "subwidgets[\""+key+"\"].name");
    legendTd.appendChild(aux3);
    aux3 = document.createElement("a");
    aux3.setAttribute("id", $scope.uuid());
    aux3.setAttribute("href","/layout/"+subClass);
    aux3.innerHTML = subClass;
    legendTd.appendChild(aux3);
    //legendTd.appendChild(auxLabel);
    formElement.appendChild(legendTd);


    var availabilityTd = document.createElement("td");
    availabilityTd.setAttribute("class", "text-center");
    var aux = document.createElement('input');
    aux.type="checkbox";
    var idAvailable = $scope.uuid();
    aux.setAttribute("id", idAvailable);
    aux.setAttribute("ng-model", "subwidgets[\""+key+"\"].availability");
    availabilityTd.appendChild(aux);
    formElement.appendChild(availabilityTd);

    var positionTd = document.createElement("td");
    var aux2 = document.createElement('input');
    aux2.type="number";
    var idNumber = $scope.uuid();
    aux2.setAttribute("id", idNumber);
    //aux2.setAttribute("value", position);
    aux2.setAttribute("ng-model", "subwidgets[\""+key+"\"].position");
    positionTd.appendChild(aux2);
    formElement.appendChild(positionTd);
    $compile(formElement)($scope);
    var parent = document.getElementById(elem).appendChild(formElement);
    $scope.subwidgets[key].availability = available;
    $scope.subwidgets[key].name = name||subClass;
    $scope.subwidgets[key].widgetClass = subClass;
    $scope.subwidgets[key].position = parseInt(position);
    return;

  }


  $scope.letMeKnow = function(){
    msg = {widgetClass: uriClass, bnodes: [], subwidgets: {} };
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
    msg.subwidgets = $scope.subwidgets;
   var submitUrl = '/saveLayout';
   $http({url: submitUrl,
     data: msg,
     method: "POST",

   }).
   success(function(data, status, headers, config) {
    alert("Ok");
    location.reload();
  }).
   error(function(data, status, headers, config) {
    alert("Error");
  });
  }

  $("#uriLabel").attr("data-predicate", labelPredicate);
  $scope.initForm = function(){
    $scope.formData = d.main;
    if(instanceData != null){
      $("#uriLabel").val(instanceData[labelPredicate][0]);
    }
    $scope.formData.forEach(function(datum){
      var propertyName = datum.predicate.mirroredUri;
      if(datum.predicatePreferedLabel != null && datum.predicatePreferedLabel != undefined && datum.predicatePreferedLabel.value != "" && datum.predicatePreferedLabel.value != null){
        propertyName = datum.predicatePreferedLabel.value;
      }else{
        if(datum.predicateLabel != null && datum.predicateLabel != undefined && datum.predicateLabel.value != "" && datum.predicateLabel.value != null){
          propertyName = datum.predicateLabel.value;
        }
      }
      var propertyDisplay = true;
      console.log(datum);
      if(datum.displayed != null && datum.displayed != undefined && datum.displayed.value != undefined && datum.displayed.value != null && (datum.displayed.value.toLowerCase() === "false" || datum.displayed.value === "0")){
        propertyDisplay = false;
      }
      if(datum.sub_class != null && datum.sub_class.value != null && datum.sub_class.value != ""){
        $scope._getSubWidget(propertyName, datum.sub_class.mirroredUri, datum.position.value, propertyDisplay, datum.htmlElement.value);
        //predicate, name, subClass, position, available, elem
      }else{
        $scope._getWidget(datum.widget.mirroredUri, propertyName, datum.predicate.mirroredUri, datum.position.value, propertyDisplay, datum.htmlElement.value);
      }
    });


    var submit = document.createElement("button");
    //submit.type="submit";
    submit.setAttribute("class", "btn btn-primary");
    submit.innerHTML = submitLabel;
    submit.setAttribute("ng-click", "letMeKnow()");
    document.getElementById("myForm").appendChild(submit);



    $compile(submit)($scope);

  }
$scope.initForm();
}]) ;
layoutFormApp.controller('createPredicateCtrl', ['$scope', '$http', function($scope, $http, $compile){
    $scope.positionExisting = 10;
    $scope.positionNew = 10;
    $scope.predicateNew = baseNamespace;
    $scope.availablePredicates = existingPredicates;
    $scope.availableSubwidgets = existingWidgets;
    $scope.selectedPredicate = {name: null, value: null};
    $scope.selectedExistingWidget = null;
    $scope.selectedNewWidget = null;
    $scope.msg = {};
    $scope.availableSubwidgetPredicate = [];
    $scope.selectedSubwidgetPredicate = null;
    $scope.selectedSubwidget = null;

    $scope.reloadPredicatesForSubwidget = function(){
      console.log($scope.selectedSubwidget);
      $http.get("/getPredicates",{
        params:{
          domain: $scope.selectedSubwidget["value"],
          range: uriClass
        }
      }).
      success(function(data, status, headers, config) {
        $scope.availableSubwidgetPredicate = data;
      }).
      error(function(){
        alert("Error");
      });
    }

    $scope.submitNewSubwidget = function(){
      if($scope.selectedSubwidget == null){
        alert("Debe seleccionar un widget");
        return;
      }
      if($scope.selectedSubwidgetPredicate == null){
        alert("Debe seleccionar una propiedad");
        return;
      }
      var msg = {
        "subWigetClass": $scope.selectedSubwidget["value"],
        "position": $scope.positionExisting,
        "widgetClass": uriClass,
        "predicate": $scope.selectedSubwidgetPredicate["uri"]
      }
      console.log(msg);
      $http({url: "/createSubwidget",
       data: msg,
       method: "POST",
      }).
      success(function(){
        alert("Subwidget agregado");
        window.reload();
      }).
      error(function(){
        alert("Error");
      })
    }

    $scope.getUriForWidget = function(v){
      if(v ==  null || v == ""){
        return null;
      }
      if(v == "text"){
        return "http://cognita.io/poderoEditor/layoutOntology/HTMLInputTextWidget"
      }
      if(v == "date"){
        return "http://cognita.io/poderoEditor/layoutOntology/HTMLInputDateWidget"
      }
      if(v == "resource"){
        return "http://cognita.io/poderoEditor/layoutOntology/HTMLResourceWidget"
      }
      return "http://cognita.io/poderoEditor/layoutOntology/HTMLInputTextWidget";
    }

    $scope.checkIfResource = function(){
      if($scope.selectedNewWidget == "resource"){
          $("#newPredicateDomain").select2("enable", true);
      }else{
          $("#newPredicateDomain").select2("enable", false);
          $("#newPredicateDomain").select2('val', '');
      }
    }

    $scope.submitExistingPredicate = function(){
      $scope.msg = {
        predicate: $scope.selectedPredicate.value,
        position: $scope.positionExisting,
        viewClass: uriClass,
        widgetClass: $scope.getUriForWidget($scope.selectedExistingWidget),
        domain: null
      }
      $scope.submitPredicate();
    }

    $scope.submitNewPredicate = function(){
      var range = null;
      if($scope.selectedNewWidget == "resource"){
        if(($("#newPredicateDomain").select2("data")) == null){
          alert("No hay rango definido");
          return;
        }
        range = ($("#newPredicateDomain").select2("data")).id.mirroredUri;
        console.log(range);
      }
      if(range != null){
        $scope.msg = {
          predicate: $scope.predicateNew,
          position: $scope.positionNew,
          viewClass: uriClass,
          widgetClass: $scope.getUriForWidget($scope.selectedNewWidget),
          range: range
        }
      }else{
        $scope.msg = {
          predicate: $scope.predicateNew,
          position: $scope.positionNew,
          viewClass: uriClass,
          widgetClass: $scope.getUriForWidget($scope.selectedNewWidget)
        }
      }
      console.log($scope.msg);
      $scope.submitPredicate();
    }

    $scope.submitPredicate = function(){
      if(isNaN($scope.msg.position) || $scope.msg.position < 0){
        alert("Posición debe ser un número mayor a 0");
        return;
      }
      if($scope.msg.predicate == "" || $scope.msg.predicate == null){
        alert("Debe escoger un predicado");
        return;
      }
      if($scope.msg.widgetClass == "" || $scope.msg.widgetClass == null){
        alert("Debe escoger un widget");
        return;
      }
       console.log($scope.msg);

      $http({url: "/createPredicate",
       data: $scope.msg,
       method: "POST",
      }).
      success(function(data, status, headers, config) {
        alert("Nuevo predicado creado");
        window.reload();
      }).
      error(function(data, status, headers, config) {
        alert("Error");
      });
    }


    $("#newPredicateDomain").select2({
    placeholder: "",
    minimumInputLength: 1,
    ajax: { // instead of writing the function to execute the request we use Select2's convenient helper
        url: function(terms){return "/searchClass/"+terms},
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
  });
  $("#newPredicateDomain").select2("enable", false);
  }]);