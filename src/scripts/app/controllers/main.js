angular.module('cea')
.controller('MainController', function($scope,auth,$state) {
    $scope.siteTitle = "Centre for Effective Altruism — Administration"

    $scope.Logout = function(){
    	auth.logout(function(){
    		console.log('Logged out')
	    	$state.go('login')
    	})
    }

})
.run(function($rootScope,$state,auth,$timeout){
	$rootScope.$on('$stateChangeStart', 
	function(event, toState, toParams, fromState, fromParams){ 
		if(toParams.token && toParams.uid){
	    	auth.storeToken(toParams.token,toParams.uid,function(){
	    		$timeout(function(){
			        auth.isAuthenticated(function(isAuthenticated){
			        	if(isAuthenticated){
						   	$state.go('fundraising')
			        	}
						else{
							if(toState!=='login'){
								$state.go('login')
							}

						}
			        })
			    },500)
	    	});
	    } else {
			// redirect to login if we're not authenticated
			auth.isAuthenticated(function(isAuthenticated){
				$rootScope.isAuthenticated = isAuthenticated;
				if(isAuthenticated){
					if(toState.name === 'login'){
						$state.go('home')
						event.preventDefault(); 	
					}
					return false;
				}
				$state.go('login')
				event.preventDefault(); 	
			})
		}
		
	})
})