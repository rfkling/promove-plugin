define(['underscore'], function (_) {

    var sidebarController = ['$scope', '$location', '$window', function ($scope, $location, $window) {
        $scope.isActive = function (route) {
            return route === $location.path();
        }

        $scope.trackers = _.map(window.trackers, function (x) {
            return { Id: x.id, Name: x.name };
        });
    }];

    return sidebarController;

});