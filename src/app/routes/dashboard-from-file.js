define([
  'angular',
  'jquery',
  'config',
  'lodash'
],
function (angular, $, config, _) {
  "use strict";

  var module = angular.module('grafana.routes');

  module.config(function($routeProvider) {
    $routeProvider
      .when('/dashboard/file/:jsonFile', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'DashFromFileProvider',
        reloadOnSearch: false,
      });
  });

  module.controller('DashFromFileProvider', function($scope, $rootScope, $http, $routeParams, alertSrv) {

    var renderTemplate = function(json,params) {
      var _r;
      _.templateSettings = {interpolate : /\{\{(.+?)\}\}/g};
      var template = _.template(json);
      var rendered = template({ARGS:params});
      try {
        _r = angular.fromJson(rendered);
      } catch(e) {
        _r = false;
      }
      return _r;
    };

    var file_load = function(file) {
      return $http({
        url: "app/dashboards/"+file.replace(/\.(?!json)/,"/")+'?' + new Date().getTime(),
        method: "GET",
        transformResponse: function(response) {
          return renderTemplate(response,$routeParams);
        }
      }).then(function(result) {
        if(!result) {
          return false;
        }
        return result.data;
      },function() {
        alertSrv.set('Error',"Could not load <i>dashboards/"+file+"</i>. Please make sure it exists" ,'error');
        return false;
      });
    };

    file_load($routeParams.jsonFile).then(function(result) {
      $scope.initDashboard(result, $scope);
       init = 1;
       cur_angle = 0;
       angle = 0;
       sun = 0;
       t_offset = 0;
       intervallId = setInterval(function () {updateView();}, 10000);
       setTimeout(function ()
       {
           document.getElementById('system-overview').style.display = "block";
           //document.getElementById('system-overview').style.opacity = 1;
           document.getElementById('system-overview').className = "apollo-panel fadeIn";
           document.getElementById('svg-timerange').style.display = "list-item";
           document.getElementById('svg-refresh').style.display = "list-item";
           document.getElementById('grafana-menu-zoom-out').style.display = "none";
           document.getElementById('grafana-menu-home').style.display = "none";
           setTimeout(function () {
               updateView();
           }, 3000);
       }, 2000);
    });

  });

});
