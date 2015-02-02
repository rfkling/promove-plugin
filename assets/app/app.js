define(['config/routes', 'pages/indexCtrl', 'pages/projectsCtrl', 'pages/sidebarCtrl', 'pages/trackerCtrl'], function (routeManager, indexController, projectsController, sidebarController, trackerController) {

    var appName = 'app';
    var depends = ['ngRoute'];
    var app = angular.module(appName, depends)
        .config(routeManager);

    app.controller('IndexController', indexController);
    app.controller('ProjectsController', projectsController);
    app.controller('SidebarController', sidebarController);
    app.controller('TrackerController', trackerController);

    angular.bootstrap(document.getElementsByTagName("body")[0], [appName]);

    return app;
});