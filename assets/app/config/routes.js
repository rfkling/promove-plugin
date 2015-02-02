define([], function () {

    var routeManager = ["$routeProvider", function ($routeProvider) {

        var baseUrl = '/redmine/plugin_assets/promove/';

        $routeProvider.when('/', {
            templateUrl: baseUrl + 'app/pages/index.tpl.html',
            controller: 'IndexController'
        });

        $routeProvider.when('/projects', {
            templateUrl: baseUrl + 'app/pages/projects.tpl.html',
            controller: 'ProjectsController'
        });

        $routeProvider.when('/tracker/:id', {
            templateUrl: baseUrl + 'app/pages/tracker.tpl.html',
            controller: 'TrackerController'
        });

        $routeProvider.otherwise({
            redirectTo: '/'
        });

    }];

    return routeManager;
});