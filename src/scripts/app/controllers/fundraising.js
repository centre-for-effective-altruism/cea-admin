angular.module('cea')
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
        api.post('fundraising/donations',data)
        .then(function(response) {
            $scope.donations = response.data;
            $scope.NewDonation = {
                timestamp:moment().format()
            };
        })
    }

    $scope.Donation.read = function(){
        // Get all donations
        api.get('fundraising/donations')
        .then(function(response){
            $scope.donations = response.data;
        })
        
    }

    $scope.Donation.delete = function(ID){
        api.delete('fundraising/donations/'+ID)
        .then(function(response) {
            $scope.donations = response.data;
        })
    }

    // DONOR MODEL
    
    $scope.donors = {};
    $scope.Donor = {};
    $scope.Donor.create = function(){
        var data = {
            name: $scope.NewDonor.name
        }

        api.post('fundraising/donors',data)
        .then(function(response) {
            $scope.donors = response.data;
            $scope.NewDonor = {}
        });
    }

    $scope.Donor.read = function(){
        // Get all donors
        api.get('fundraising/donors')
        .then(function(response) {
            $scope.donors = response.data;
        });
    }

    $scope.Donor.delete = function(ID){
        api.delete('fundraising/donors/'+ID)
        .then(function(response) {
            $scope.donors = response.data;
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
        api.post('fundraising/organisations',data)
        .then(function(response) {
            $scope.organisations = response.data;
            $scope.NewOrganisation = {}
        });
    }

    $scope.Organisation.read = function(){
        // Get all organisations
        api.get('fundraising/organisations')
        .then(function(response) {
            $scope.organisations = response.data;
        })
    }

    // $scope.Organisation.update = function(slug,data){
    //     data.slug = data.slug || slug;
    //     api.put('fundraising/organisations')
    //     .then(function(response) {
    //         $scope.organisations = response.data;
    //     });
    // }

    $scope.Organisation.delete = function(slug){
        api.delete('fundraising/organisations/'+slug)
        .then(function(response) {
            $scope.organisations = response.data;
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
        api.post('fundraising/targets',data)
        .then(function(response) {
            $scope.targets = response.data;
            $scope.NewTarget = {}
        });
    }

    $scope.Target.read = function(){
        // Get all targets
        api.get('fundraising/targets')
        .then(function(response) {
            $scope.targets = response.data;
        });
    }

    $scope.Target.update = function(id,data){
        data.id = data.id || id
        api.put('fundraising/targets',data)
        .then(function(response) {
            $scope.targets = response.data;
        });
    }

    $scope.Target.delete = function(slug){
        api.delete('fundraising/targets/'+slug)
        .then(function(response) {
            $scope.targets = response.data;
        })
    }

    // PROGRESS BAR MODEL
    $scope.Progress = {};
    $scope.progress = {};
    $scope.Progress.read = function(){
        api.get('fundraising/progress')
        .then(function(response){
            $scope.progress = response.data;

            $scope.progressTotal = {
                difference: 0,
                donations: 0,
                organisationname: "Organisation Totals",
                organisationslug: "total",
                progress: 0,
                target: 0
            }
            angular.forEach(response.data,function(org){
                $scope.progressTotal.difference += parseInt(org.difference);
                $scope.progressTotal.donations += parseInt(org.donations);
                $scope.progressTotal.target += parseInt(org.target);
            })
            $scope.progressTotal.progress = $scope.progressTotal.donations / $scope.progressTotal.target * 100;
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