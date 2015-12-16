angular.module('ceaAuth',[
    'ceaApi'
])
.factory('auth',function($http,api,$cookies){
    
    function storeToken(token,uid,callback){
        $cookies.put('cea_api_token',token);
        $cookies.put('cea_api_uid',uid);
        if(typeof callback === "function") callback()
    }

    function checkAuthenticated(successCallback,errorCallback){
        api.get('auth/check-token')
        .then(function(response){
            setAuthenticated();
            if(typeof successCallback === "function") successCallback(response)
        },function(error){
            if(typeof errorCallback === "function") errorCallback(error)
        })
    }

    function setAuthenticated(){
        // check authentication with server every 5 minutes
        var expires = new Date();
        expires.setMinutes( expires.getMinutes() + 5 );
        $cookies.put('cea_api_authenticated','true',{expires:expires})
    }

    function isAuthenticated(callback){
        if($cookies.get('cea_api_authenticated')){
            callback(true)            
        } else {
            checkAuthenticated(function(){
                callback(true)
            },function(){
                callback(false)
            })
        }
    }

    function logout(callback){
        api.get('auth/logout')
        .then(function(response){
            $cookies.remove('cea_api_token')
            $cookies.remove('cea_api_uid')
            $cookies.remove('cea_api_authenticated')
            callback()
        })
    }

    return {
        isAuthenticated: isAuthenticated,
        checkAuthenticated: checkAuthenticated,
        storeToken: storeToken,
        logout: logout
    }

})