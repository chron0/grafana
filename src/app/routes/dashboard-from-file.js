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
       aclouds = 0;
       oclouds = 0;
       t_offset = 0;

       setTimeout(function ()
       {
           document.getElementById('system-overview').style.display = "block";
           document.getElementById('system-overview').className = "apollo-panel fadeIn";

           if(getCookie('visited'))
           {
               setCookie('visited',1,365);
           }
           else
           {
               document.getElementById('primer').style.display = "block";
               document.getElementById('primer').className = "fadeIn";
               setCookie('visited',1,365);
           }

           setTimeout(function () {
               intervallId = setInterval(function () {updateView();}, 10000);
               updateView();
           }, 3000);
       }, 2000);

       var _paq = _paq || [];
       _paq.push(["trackPageView"]);
       _paq.push(["enableLinkTracking"]);
       (function() {
           var u = "https://apollo.open-resource.org/flight-control/stats/";
           _paq.push(["setTrackerUrl", u + "piwik.php"]);
           _paq.push(["setSiteId", "1"]);
           var d = document,
           g = d.createElement("script"),
           s = d.getElementsByTagName("script")[0];
           g.type = "text/javascript";
           g.defer = true;
           g.async = true;
           g.src = u + "piwik.js";
           s.parentNode.insertBefore(g, s);
       })();

       setTimeout(function ()
       {
           document.getElementById('svg-timerange').style.display = "list-item";
           document.getElementById('grafana-menu-zoom-out').style.display = "none";
           document.getElementById('grafana-menu-home').style.display = "none";
           document.getElementById('topnav_title').setAttribute("style", "font-size: 22px; line-height: 16px; padding: 9px 0;");
           document.getElementById('topnav_title').innerHTML = "Apollo-NG VFCC<br /><b class='topnav_timestamp'>Initializing Interface...</b>";
       },1000);

    });

  });

});
