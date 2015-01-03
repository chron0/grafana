define([
  'angular',
],
function (angular) {
  "use strict";

  var module = angular.module('grafana.routes');

  module.config(function($routeProvider) {
    $routeProvider
      .when('/dashboard/db/:id', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'DashFromDBProvider',
        reloadOnSearch: false,
      })
      .when('/dashboard/elasticsearch/:id', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'DashFromDBProvider',
        reloadOnSearch: false,
      })
      .when('/dashboard/temp/:id', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'DashFromDBProvider',
        reloadOnSearch: false,
      })
      .when('/dashboard/import/:id', {
        templateUrl: 'app/partials/dashboard.html',
        controller : 'DashFromImportCtrl',
        reloadOnSearch: false,
      });

  });

  module.controller('DashFromDBProvider', function($scope, $rootScope, datasourceSrv, $routeParams) {

    var db = datasourceSrv.getGrafanaDB();
    var isTemp = window.location.href.indexOf('dashboard/temp') !== -1;

    db.getDashboard($routeParams.id, isTemp)
    .then(function(dashboard) {
      $scope.initDashboard(dashboard, $scope);
      document.getElementById('system-overview').style.display = "none";
      document.getElementById('svg-timerange').style.display = "none";
      document.getElementById('grafana-menu-zoom-out').style.display = "list-item";
      document.getElementById('grafana-menu-home').style.display = "list-item";
      clearInterval(intervallId);

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

      document.getElementById('emboss').style.display = "none";

    }).then(null, function(error) {
      $scope.initDashboard({ title: 'Grafana'}, $scope);
      $scope.appEvent('alert-error', ['Dashboard load failed', error]);
    });
  });

  module.controller('DashFromImportCtrl', function($scope, $location) {

    if (!window.grafanaImportDashboard) {
      $scope.appEvent('alert-warning', ['Dashboard load failed', 'Cannot reload unsaved imported dashboard']);
      $location.path('');
      return;
    }

    $scope.initDashboard(window.grafanaImportDashboard, $scope);
  });

});
