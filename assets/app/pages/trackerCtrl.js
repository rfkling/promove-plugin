define(['model/tracker'], function (Tracker) {

    var trackerController = ['$scope', '$window', '$route', function ($scope, $window, $route) {

        var trackerId = $route.current.params.id;
         
        var tracker = _.find(window.trackers, function (x) { return x.id == trackerId; });

        $scope.tracker = new Tracker(tracker);
        $scope.xFunction = function () {
            return function (d) {
                return d.CustomValue;
            };
        }
        $scope.yFunction = function () {
            return function (d) {
                return d.Count;
            };
        }
        $scope.descriptionFunction = function () {
            return function (d) {
                return '<p>' + d.Count + ' ocorrências</p>'
                    + '<p>' + d.Effort + ' horas de retrabalho</p>';
            }
        }

    }];

    return trackerController;
});