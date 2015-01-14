var csvUploaderApp = angular.module('csvUploaderApp', []);
csvUploaderApp.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
}]);

csvUploaderApp.controller('csvUploaderCtrl', ['$scope', '$http', function($scope, $http){

    $scope.dataset = [];
    $scope.headers = [];
    $scope.predicates = predicates;
    $scope.urlTerms = [];
    $scope.uriTemplate = baseNamespace;
    //============== DRAG & DROP =============
    // source for drag&drop: http://www.webappers.com/2011/09/28/drag-drop-file-upload-with-html5-javascript/
    var dropbox = document.getElementById("dropbox")
    $scope.dropText = 'Drop files here...'
    // init event handlers
    function dragEnterLeave(evt) {
        evt.stopPropagation()
        evt.preventDefault()
        $scope.$apply(function(){
            $scope.dropText = 'Drop files here...'
            $scope.dropClass = ''
        })
    }
    dropbox.addEventListener("dragenter", dragEnterLeave, false)
    dropbox.addEventListener("dragleave", dragEnterLeave, false)
    dropbox.addEventListener("dragover", function(evt) {
        evt.stopPropagation()
        evt.preventDefault()
        var clazz = 'not-available'
        var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0
        $scope.$apply(function(){
            $scope.dropText = ok ? 'Arrastre archivo aquí...' : 'Sólo archivos son permitodos!'
            $scope.dropClass = ok ? 'over' : 'not-available'
        })
    }, false)
    dropbox.addEventListener("drop", function(evt) {
        console.log('drop evt:', JSON.parse(JSON.stringify(evt.dataTransfer)))
        evt.stopPropagation()
        evt.preventDefault()
        $scope.$apply(function(){
            $scope.dropText = 'Arrastre archivos aquí...'
            $scope.dropClass = ''
        })
        var files = evt.dataTransfer.files
        if (files.length > 0) {
            $scope.$apply(function(){
                $scope.files = []
                for (var i = 0; i < files.length; i++) {
                    $scope.files.push(files[i])
                }
            })
        }
    }, false)
    //============== DRAG & DROP =============

    $scope.setFiles = function(element) {
        $scope.$apply(function() {
          console.log('files:', element.files);
      // Turn the FileList object into an Array
      $scope.files = []
      for (var i = 0; i < element.files.length; i++) {
          $scope.files.push(element.files[i])
      }
      $scope.progressVisible = false
  });
    };

    $scope.uploadFile = function() {
        if($scope.files ==  undefined){
            alert("No file selected!");
            return;
        }
        var fd = new FormData()
        for (var i in $scope.files) {
            fd.append("file", $scope.files[i])
        }
        var xhr = new XMLHttpRequest()
        xhr.upload.addEventListener("progress", uploadProgress, false)
        xhr.addEventListener("load", uploadComplete, false)
        xhr.addEventListener("error", uploadFailed, false)
        xhr.addEventListener("abort", uploadCanceled, false)
        xhr.open("POST", "/uploadCsv")
        $scope.progressVisible = true
        xhr.send(fd)
    }

    function uploadProgress(evt) {
        $scope.$apply(function(){
            if (evt.lengthComputable) {
                $scope.progress = Math.round(evt.loaded * 100 / evt.total)
            } else {
                $scope.progress = 'unable to compute'
            }
        })
    }

    function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
        $scope.progressVisible = false;
        var response = JSON.parse(evt.target.responseText);
        $scope.loadCsv(response.url);
    }

    function uploadFailed(evt) {
        $scope.progressVisible = false;
        alert("There was an error attempting to upload the file.")
    }

    function uploadCanceled(evt) {
        $scope.$apply(function(){
            $scope.progressVisible = false;
        })
        alert("The upload has been canceled by the user or the browser dropped the connection.")
    }



    $scope.loadCsv = function(filename){
       $http.get("/files/"+filename).then(function(response){
        console.log(response);
        $("div.hidden").removeClass("hidden");
        var d = response.data.split("\n");
        var h = d.shift().split(",")
        var d2 = [];
        for(var i=0; i<Math.min(d.length, 20); i++){
            d2.push(d[i].split(","));
        }
        $scope.dataset = d2;
        $scope.headers = h;
    });
   }

   $scope.addToURLTemplate = function(elem, pos){
    var val = elem[0][0].replace(/ /, "_", "g").toLowerCase();
    if ($scope.urlTerms.map(function(e){return e.name}).indexOf(val) < 0){
        $scope.urlTerms.push({name: val, position: pos[0][0]} );
    }else{
        var i = $scope.urlTerms.map(function(e){return e.name}).indexOf(val);
        $scope.urlTerms.splice(i, 1);
    }
    $scope.uriTemplate = baseNamespace+$scope.urlTerms.map(function(e){return e.name}).join("_");
   }

   $scope.convert = function(){
    var triples = [];
    var selects = $("select option:selected");
    var predicateList = [];
    selects.each(function(i, item){
        predicateList.push($(item).val());
    });

    var trs = $("tbody tr");
    trs.each(function(i, item){
        $tr = $(item);
        var a = baseNamespace;
        var aux = [];
        if($scope.urlTerms.length == 0){
            alert("Need elements for URI");
            return;
        }
        $scope.urlTerms.map(function(e){return e.position}).forEach(function(pos){
            td = $tr.find("td")[pos];
            aux.push($(td).html());
        });
        a += aux.join("_");
        aLabel = aux.join(" ");
        triples.push({s: {value: a, type: "uri"}, p: "http://www.w3.org/2000/01/rdf-schema#label", o: {value: aLabel, type: "text"} });
        triples.push({s: {value: a, type: "uri"}, p: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", o: {value: "http://xmlns.com/foaf/0.1/Person", type: "uri"} });
        $tr.find("td").each(function(j, td){
            $td = $(td);
            triples.push({s: {value: a, type: "uri"}, p: predicateList[j], o: {value: $td.html(), type: "text"} });
        });
    });
    console.log(triples);
    $http({url: "/importData",
        data: {triples: triples},
        method: "POST",
    }).
    success(function(data, status, headers, config) {
        window.location = "/search";
    }).
    error(function(data, status, headers, config) {
      alert("Error");
  });
}
}
])


