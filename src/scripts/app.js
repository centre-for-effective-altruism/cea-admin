

angular.module('cea', [
    'ui.router',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
    'angularMoment'
])


.config(function($stateProvider, $urlRouterProvider,$locationProvider) {
  //
  $locationProvider.html5Mode(true);
  // For any unmatched url, redirect to /home
  $urlRouterProvider.otherwise("/home");
  //
  // Now set up the states
  $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: "partials/home.html"
    })
    .state('fundraising', {
      url: "/fundraising",
      templateUrl: "partials/fundraising.html",
      controller: "FundraisingController"
    })
})

.constant('config',{
    'apiURL': 'https://api.centreforeffectivealtruism.org/v1/'
})

.factory('api',['$http','config', function($http,config){
    function http(method){
        return function (route,data,callback){

            if(typeof callback === 'undefined' && typeof data === 'function'){
                callback = data;
            }

            var options = {
                method: method,
                url: config.apiURL + route
            }

            if((method === 'POST' || method==='PUT') && typeof data !== 'function'){
                options.data = data;
            }
            $http(options)
            .success(function(data){
                if(typeof callback === 'function'){
                    callback(data);
                } else {
                    return data;
                }
            })
            .error(function(error){
                console.log('Error: ' + error);
            })
        }
    }

    return {
        post: http('POST'),
        get: http('GET'),
        delete: http('DELETE'),
        put: http('PUT')
    }
}])

.controller('MainController', function($scope) {
    $scope.title = "Centre for Effective Altruism — Administration"
})


.controller('FundraisingController', function($scope, api, moment) {

    $scope.title = "Fundraising";

    // DONATION MODEL
    
    $scope.donations = {};
    $scope.Donation = {};
    $scope.NewDonation = {
        timestamp:moment().format()
    };
    $scope.Donation.create = function(){
        var data = {
            amount: $scope.NewDonation.amount,
            donor: $scope.NewDonation.donor,
            organisation: $scope.NewDonation.organisation,
            timestamp: $scope.NewDonation.timestamp,
            anonymous: $scope.NewDonation.anonymous
        }
        api.post('donations',data,function(data) {
            $scope.donations = data;
            $scope.NewDonation = {
                timestamp:moment().format()
            };
        })
    }

    $scope.Donation.read = function(){
        // Get all donations
        api.get('donations', function(data){
            $scope.donations = data;
        })
        
    }

    $scope.Donation.delete = function(ID){
        api.delete('donations/'+ID,function(data) {
            $scope.donations = data;
        })
    }

    // DONOR MODEL
    
    $scope.donors = {};
    $scope.Donor = {};
    $scope.Donor.create = function(){
        var data = {
            name: $scope.NewDonor.name
        }
        console.log($scope.NewDonor)

        api.post('donors',data,function(data) {
            $scope.donors = data;
            $scope.NewDonor = {}
        });
    }

    $scope.Donor.read = function(){
        // Get all donors
        api.get('donors',function(data) {
            $scope.donors = data;
        });
    }

    $scope.Donor.delete = function(ID){
        api.delete('donors/'+ID,function(data) {
            $scope.donors = data;
        });
    }

    // ORGANISATION MODEL
    $scope.organisations = {};
    $scope.Organisation = {};

    $scope.Organisation.create = function(){
        var data = {
            slug: $scope.NewOrganisation.slug,
            name: $scope.NewOrganisation.name
        }
        api.post('organisations',data,function(data) {
            $scope.organisations = data;
            $scope.NewOrganisation = {}
        });
    }

    $scope.Organisation.read = function(){
        // Get all organisations
        api.get('organisations',function(data) {
            $scope.organisations = data;
        })
    }

    $scope.Organisation.update = function(slug,data){
        data.slug = data.slug || slug;
        api.put('organisations',function(data) {
            $scope.organisations = data;
        });
    }

    $scope.Organisation.delete = function(slug){
        api.delete('organisations/'+slug,function(data) {
            $scope.organisations = data;
        });
    }

    // TARGETS MODEL
    $scope.targets = {};
    $scope.Target = {};

    $scope.Target.create = function(){
        var data = {
            slug: $scope.NewTarget.slug,
            name: $scope.NewTarget.name
        }
        api.post('targets',data,function(data) {
            $scope.targets = data;
            $scope.NewTarget = {}
        });
    }

    $scope.Target.read = function(){
        // Get all targets
        api.get('targets',function(data) {
            $scope.targets = data;
        });
    }

    $scope.Target.update = function(id,data){
        data.id = data.id || id
        console.log(data)
        api.put('targets',data,function(data) {
            $scope.targets = data;
        });
    }

    $scope.Target.delete = function(slug){
        api.delete('targets/'+slug,function(data) {
            $scope.targets = data;
        })
    }

    // PROGRESS BAR MODEL
    $scope.Progress = {};
    $scope.progress = {};
    $scope.Progress.read = function(){
        api.get('progress',function(data){
            $scope.progress = data;  
        })
        
    }


    $scope.Donation.read()
    $scope.Donor.read()
    $scope.Organisation.read()
    $scope.Target.read()
    $scope.Progress.read()

    // watch vars for changes, if
    $scope.$watchGroup(['donations','targets'], function() {
        $scope.Progress.read()
    });


    // datepicker logic 
    $scope.isOpen = false;
     $scope.openCalendar = function(e) {
        e.preventDefault();
        e.stopPropagation();
        $scope.isOpen = true;
    };


});