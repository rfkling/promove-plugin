var baseUrl = '/redmine/plugin_assets/promove/';

require.config({
    baseUrl: baseUrl.concat('app'),
    paths: {
        'angular': baseUrl + 'bower_components/angular/angular',
        'angular-route': baseUrl + 'bower_components/angular-route/angular-route',
        'ui-bootstrap': baseUrl + 'bower_components/angular-bootstrap/ui-bootstrap',
        'underscore': baseUrl + 'bower_components/underscore/underscore',
        'highcharts': baseUrl + 'bower_components/highcharts-release/highcharts'
    },
    shim: {
        'angular': {},
        'angular-route': {
            deps: ['angular']
        },
        'ui-bootstrap': {
            deps: ['angular']
        },
        'app': {
            deps: ['angular']
        },
        'underscore': {
            exports: '_'
        }
    },
    waitSeconds: 0
});

require(['angular', 'angular-route', 'ui-bootstrap', 'underscore','highcharts', 'app'], function () {
    //Application has started
});