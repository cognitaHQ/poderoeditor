var clasFormApp = angular.module('classFormApp', []);

clasFormApp.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
}]);

clasFormApp.controller('createClassCtrl', ['$scope', '$http', '$compile', function($scope, $http, $compile){
	$scope.tree = {};

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

    var r = {"text": name, "state" : { "opened" : false}, "children": []};
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
    console.log(classes);
    // [
    //     { 
    //       "text" : "Root node", 
    //       "state" : { "opened" : true }, 
    //       "children" : [
    //       { 
    //         "text" : "Alvaro", 
    //         "state" : {},
    //         "children": [
    //         {
    //           "state" : { "opened" : true }, 
    //           "text": "Nicolas"
    //         }
    //         ]
    //       },
    //       { "text" : "Child node 2", "state" : {  } }
    //       ]
    //     }
    //     ]
    $('#classTree').jstree({
      'core' : {
        'data' : classes
      }
    });

  }

  $scope.createTree();
}])