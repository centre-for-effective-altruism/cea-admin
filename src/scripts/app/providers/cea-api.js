angular.module('ceaApi',[])
.factory('api',function($http,$cookies){

    var apiUrl = window.location.href.search('localhost') === -1 ? 'https://api.centreforeffectivealtruism.org/v1/' : 'http://localhost:3000/v1/'
    
    function http(method){
        return function (route,data){

            var options = {
                method: method,
                url: apiUrl + route
            }

            if(data){
                options.data = data;
            }

            var token = $cookies.get('cea_api_token');
            var uid = $cookies.get('cea_api_uid');

            if(token && uid){
                options.params = {
                    token: token,
                    uid: uid
                }
            }
            
            return $http(options)
        }
    }

    return {
        post: http('POST'),
        get: http('GET'),
        delete: http('DELETE'),
        put: http('PUT')
    }
})