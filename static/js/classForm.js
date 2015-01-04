var clasFormApp = angular.module('classFormApp', []);

clasFormApp.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
}]);

clasFormApp.controller('createClassCtrl', ['$scope', '$http', '$compile', function($scope, $http, $compile){

  $scope.selectedParentClass = "http://www.w3.org/2002/07/owl#Class";
  $scope.newClassUri = baseNamespace;
  $scope.newClassName = "";
  $scope.urlify = function(u){
   return u.toLowerCase().replace(/[^a-zA-Z0-9\-]+/g, '_');
  }
  $scope.changeName = function(){
    $scope.newClassUri = baseNamespace + $scope.urlify($scope.newClassName);
  }
  $scope.findClassParent = function(elem){
    var r = [];
    $.each(data, function(i, item){
      if(item.c.value == elem && item.classParent.value != null){
        r.push(item.classParent.value)
      }
    })
    return r;
  }

  $scope.findClassChildren = function(elem){
    var r = [];
    $.each(data, function(i, item){
      if(item.classParent.value == elem){
        r.push(item)
      }
    })
    return r;
  }

  $scope.findParents = function(elem){
    var r = [];
    $.each(data, function(i, item){
      var parents = $scope.findClassParent(item.c.value);
      if(parents.length == 0){
        r.push(item);
      }
    })
    return r;
  }

  $scope.travelTree = function(item){
    var name = item.c.value;
    if(item.className.value != null){
      name = item.className.value;
    }
    if(item.classNameLanguage.value != null){
      name = item.classNameLanguage.value;
    }
    if(item.classPreferedName.value != null){
      name = item.classPreferedName.value;
    }

    var r = {"text": name, "data" : { "uri": item.c.value}, "status": {"opened" : false}, "children": []};
    childrenKeys = $scope.findClassChildren(item.c.value);
    $.each(childrenKeys, function(i, child){
        var x = $scope.travelTree(child);
        r["children"].push(x);
    })
    return r;
  }

  $scope.createTree = function(){
    var p = $scope.findParents();
    var repeated = [];
    var classes = [];
    $.each(p, function(i, item){
      if(repeated.indexOf(item.c.value) < 0){
        repeated.push(item.c.value)
      }else{
        return;
      }
      var name = item.c.value;
      if(item.className.value != null){
        name = item.className.value;
      }
      if(item.classNameLanguage.value != null){
        name = item.classNameLanguage.value;
      }
      if(item.classPreferedName.value != null){
        name = item.classPreferedName.value;
      }

      classes.push($scope.travelTree(item))
    });
    $('#classTree').jstree({
      'core' : {
        'data' : classes
      }
    }).on('changed.jstree', function (e, data) {
    var i, j, r = [];
    for(i = 0, j = data.selected.length; i < j; i++) {
      r.push(data.instance.get_node(data.selected[i]).data.uri);
    }
    $scope.selectedParentClass = r.join(', ');
  });

  }
  $scope.uuid = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }
  $scope.createClass = function(){    
    var msg = {"uri": $scope.newClassUri, "name": $scope.newClassName, "parent": $scope.selectedParentClass, "triples": []}
    if($scope.newClassName == "" || $scope.newClassName == null){
      alert("Debe indicar un nombre de la clase");
      return;
    }
    $http.get("/getWidgets/"+$scope.selectedParentClass)
    .success(function(data, status, headers, config) {
      var widgetNode = "_:"+$scope.uuid();
            msg["triples"].push({s: {value: widgetNode, type: "blank"}, p: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", o: {value: "http://cognita.io/poderoEditor/layoutOntology/FormView", type: "uri"}});
            msg["triples"].push({s: {value: widgetNode, type: "blank"}, p: "http://cognita.io/poderoEditor/layoutOntology/classAssociated", o: {value: $scope.newClassUri, type: "uri"}});
      $.each(data, function(i, item){
            var blankNode = "_:"+$scope.uuid();
            msg["triples"].push({s: {value: blankNode, type: "blank"}, p: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", o: {value: item.type.value, type: "uri"}});
            msg["triples"].push({s: {value: blankNode, type: "blank"}, p: "http://cognita.io/poderoEditor/layoutOntology/predicateDisplayed", o: {value: item.predicate.value, type: "uri"}});
            msg["triples"].push({s: {value: blankNode, type: "blank"}, p: "http://cognita.io/poderoEditor/layoutOntology/positionNumber", o: {value: item.position.value, type: "number"}});
            msg["triples"].push({s: {value: blankNode, type: "blank"}, p: "http://cognita.io/poderoEditor/layoutOntology/anchoredTo", o: {value: item.anchor.value, type: "text"}});
            msg["triples"].push({s: {value: blankNode, type: "blank"}, p: "http://cognita.io/poderoEditor/layoutOntology/displayWidget", o: {value: "true", type: "boolean"}});
            msg["triples"].push({s: {value: widgetNode, type: "blank"}, p: "http://cognita.io/poderoEditor/layoutOntology/hasWidget", o: {value: blankNode, type: "blank"} });
      });
      $http({url:"/createClass",
                  data: msg,
                  method: "POST",
      })
      .success(function(){
        alert("Clase creada");
        window.location = "/editLayout";
      })
      .error(function(){
        alert("Error");
      })
    }).error(function(data, status, headers, config){
      alert("Error creando clase");
    })

  }

  $scope.createTree();
}])