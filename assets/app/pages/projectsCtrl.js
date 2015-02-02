define(['model/project', 'underscore'], function (Project, _) {

    var projectsController = ['$scope', '$window', function ($scope, $window) {

        if (!$window.projects)
            throw new Error('Missing global variable for projects');

        //Load initial data
        var mappedProjects = $.map($window.projects, function (project) {
            return new Project(project);
        });

        $scope.projects = mappedProjects;

        $scope.predicate = '-UltimaAtividade';
        $scope.query = function (x) {
            return _.isDate(x.UltimaAtividade);
        };

        $scope.selectProject = function (id) {
            if ($scope.selectedProject != null && $scope.selectedProject.Id === id)
                $scope.selectedProject = null;
            else
                $scope.selectedProject = _.find($scope.projects, function (x) { return x.Id === id; })
        };
        $scope.selectedProject = null;

        $scope.message = 'Message from index controller';
    }];

    return projectsController;
});