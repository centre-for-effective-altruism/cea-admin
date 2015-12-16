angular.module('cea')
.controller('LoginController', function($scope,api,auth,$state) {

    $scope.title = "Login";
    
    // login form controls
    $scope.loginDetails = {};
    $scope.RequestToken = function(){

    	var data = {
    		user: $scope.loginDetails.email || false,
    		origin: $scope.loginDetails.origin || '/'
    	}
    	api.post('auth/request-token',data)
    	.then(function(response){
    		$scope.tokenRequestSuccess = true;
    	},function(error){
    		console.log('Login error:')
    		console.log(error)
    		$scope.tokenRequestSuccess = false;
    	})
    }



})