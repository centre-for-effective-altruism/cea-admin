angular.module('cea')
.config(function($stateProvider, $urlRouterProvider,$locationProvider) {
    //
    $locationProvider.html5Mode(true);
    // For any unmatched url, redirect to /home
    $urlRouterProvider.otherwise("/fundraising");
    //
    // Now set up the states
    $stateProvider
    .state('home', {
        url: "/home",
        templateUrl: "partials/home.html",
        controller: "HomeController"
    })
    .state('login', {
        url: "/login?token&uid",
        templateUrl: "partials/login.html",
        controller: "LoginController"
    })
    .state('fundraising', {
        url: "/fundraising",
        templateUrl: "partials/fundraising.html",
        controller: "FundraisingController"
    })
});