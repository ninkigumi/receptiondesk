var myApp = angular.module('myApp', [])
    .config(['$httpProvider', function($httpProvider) {
        delete $httpProvider.defaults.headers.common["X-Requested-With"]
    }]);

myApp.run(function($rootScope, $http) {
    angular.rootScope = $rootScope;
    angular.http = $http;
    window.addEventListener("message", function (e) {
        $rootScope.$broadcast('event:messageReceived', true);
        console.log("message received");
        if (e.origin == 'https://ninkigumi-aaa.appspot.com' || e.origin == 'http://ninkigumi.github.com') {
            console.log(e.data);
            o = JSON.parse(e.data);
            if(o.googleAccessToken){
                setGoogleUserInfo(o.googleAccessToken);
            }else if(o.facebookAccessToken){
                setFacebookUserInfo(facebookAccessToken);
            }
        }

    }, true);

});

function isLogined(){
    if (angular.googleUserInfo || angular.facebookUserInfo){
        return true;
    }else{
        return false;
    }
}

function mainCtrl($scope, $http){
    angular.mainScope = $scope;
    $scope.loginmenu = 'loginmenu.html';
    $scope.formalert = 'formalert.html';
    $scope.isLogined = isLogined;
    $scope.googleLogin = googleLogin;
    $scope.facebookLogin = facebookLogin;
    $scope.logout = logout;

    $scope.postMessage_error_reset = function(){
        $scope.postMessage_error = false;
    }

    $scope.a = function(){
        angular.element('#receptiondesk_alert').append('<div id="messagealert_success" class="alert  alert-success fade in"><a class="close" data-dismiss="alert" href="#">×</a><strong>送信完了しました！</strong></div>');
    }

    $scope.message = {message: ''};

    //angular.googleUserInfo = JSON.parse(cookieMgr.cookie('googleUserInfo'));
    //angular.facebookUserInfo = JSON.parse(cookieMgr.cookie('facebookUserInfo'));
    if(localStorage.googleUserInfo){angular.googleUserInfo = JSON.parse(localStorage.googleUserInfo);}
    if(localStorage.facebookUserInfo){angular.facebookUserInfo = JSON.parse(localStorage.facebookUserInfo);}

    setProfile($scope);

    angular.rootScope.$on('event:messageReceived', function() {

    });

    $scope.postMessage = function(){
        if( $scope.message.message ){
            if(localStorage.googleAccessToken){
                $http.get('https://accounts.google.com/o/oauth2/tokeninfo?access_token=' + localStorage.googleAccessToken).
                    success(function(data, status, headers, config) {
                        console.log('valid google access token');
                    }).
                    error(function(data, status, headers, config) {
                        localStorage.removeItem('googleAccessToken');
                        localStorage.removeItem('googleUserInfo');
                        angular.googleUserInfo = null;
                        setProfile(angular.mainScope);
                        googleLogin();
                    })
            }
            if(localStorage.googleAccessToken || localStorage.facebookAccessToken){
                angular.element('button#smb01').button('loading');
                if(localStorage.googleAccessToken){
                    $scope.message.googleAccessToken = localStorage.googleAccessToken;
                }
                if(localStorage.facebookAccessToken){
                    $scope.message.facebookAccessToken = localStorage.facebookAccessToken;
                }
                var data = JSON.stringify( $scope.message );
                console.log(data);
                if(data !== '{}'){
                    delete $http.defaults.headers.common['X-Requested-With'];
                    //$http({method: 'POST', url: 'https://ninkigumi-contact.appspot.com/receptiondesk/jsonpost', data:data, withCredentials:true}).
                    $http.post('https://ninkigumi-contact.appspot.com/receptiondesk/jsonpost', data, {withCredentials:true}).
                        success(function(data, status, headers, config) {
                            angular.element("textarea#message").val('');
                            $scope.message.message = '';
                            angular.element('#receptiondesk_alert').append('<div id="messagealert_success" class="alert  alert-success fade in"><a class="close" data-dismiss="alert" href="#">×</a><strong>送信完了しました！</strong></div>');
                            //angular.mainScope.postMessage_success = true;
                            angular.element('button#smb01').button('reset');
                        }).
                        error(function(data, status, headers, config) {
                            angular.element('#receptiondesk_alert').append('<div id="messagealert_error" class="alert  alert-error fade in"><a class="close" data-dismiss="alert" href="#">×</a><h4 class="alert-heading">送信できませんでした！</h4><p>通信中にエラーが発生しました。</p></div>');
                            $scope.postMessage_error = true;
                            console.log($scope.postMessage_error);
                            console.log($scope);
                            angular.element('button#smb01').button('reset');
                        })

                }
            }else{
                googleLogin();
            }
        }
        return false;
    }

}

function setProfile($scope){
    if (angular.googleUserInfo){
        $scope.yourName = angular.googleUserInfo.name;
        $scope.yourPicture = angular.googleUserInfo.picture;
        $scope.yourProfile = angular.googleUserInfo.link;
        console.log($scope.yourName);
    }else{
        if (angular.facebookUserInfo){
            $scope.yourName = angular.facebookUserInfo.name;
            $scope.yourPicture = 'https://graph.facebook.com/' + angular.facebookUserInfo.id + '/picture';
            $scope.yourProfile = angular.facebookUserInfo.link;
            console.log($scope.yourName);
        }else{
            $scope.yourName = null;
        }
    }
}

function googleLogin(){
    window.open('https://accounts.google.com/o/oauth2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&state=%2Fcontact&redirect_uri=https%3A%2F%2Fninkigumi-aaa.appspot.com%2Fgoogle%2Foauth2callback&response_type=token&client_id=493252854674.apps.googleusercontent.com', '_blank', 'width=640, height=640, menubar=no, toolbar=no, scrollbars=yes');
    return false;
}

function facebookLogin(){
    window.open('https://www.facebook.com/dialog/oauth?client_id=158309567535986&redirect_uri=https://ninkigumi-aaa.appspot.com/facebook/oauth2callback&response_type=token&scope=email,publish_stream', '_blank', 'width=640, height=640, menubar=no, toolbar=no, scrollbars=yes');
    return false;
}

function logout(){
    if(localStorage.googleAccessToken){
        localStorage.removeItem('googleAccessToken');
        localStorage.removeItem('googleUserInfo');
        angular.googleUserInfo = null;
        setProfile(angular.mainScope);
    }
    if(localStorage.facebookAccessToken){
        localStorage.removeItem('facebookAccessToken');
        localStorage.removeItem('facebookUserInfo');
        angular.facebookUserInfo = null;
        setProfile(angular.mainScope);
    }
}

function signinCallback(authResult) {
    if (authResult['access_token']) {
        // Successfully authorized
        // Hide the sign-in button now that the user is authorized, for example:
        console.log(authResult['access_token']);
        setGoogleUserInfo(authResult['access_token']);
        //document.getElementById('signinButton').setAttribute('style', 'display: none');
    } else if (authResult['error']) {
        // There was an error.
        // Possible error codes:
        //   "access_denied" - User denied access to your app
        //   "immediate_failed" - Could not automatially log in the user
        // console.log('There was an error: ' + authResult['error']);
    }
}

function setGoogleUserInfo(googleAccessToken) {
    angular.http({method: 'GET', url: 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + googleAccessToken}).
        success(function(data, status, headers, config) {
            console.log(data);
            angular.googleUserInfo = data;
            setProfile(angular.mainScope);
            localStorage.googleUserInfo = JSON.stringify(data);
            localStorage.googleAccessToken = googleAccessToken;
            if( angular.mainScope.message.message ){ angular.mainScope.postMessage(); }
        })
}

function setFacebookUserInfo(facebookAccessToken) {
    angular.$http({method: 'GET', url: 'https://graph.facebook.com/me?access_token=' + o.facebookAccessToken}).
        success(function(data, status, headers, config) {
            angular.facebookUserInfo = data;
            setProfile(angular.mainScope);
            var a = {email:  data.email, first_name: data.first_name, gender: data.gender, id: data.id, last_name: data.last_name, link: data.link, name: data.name, locale: data.locale};
            //cookieMgr.cookie("facebookUserInfo", JSON.stringify(a));
            localStorage.facebookUserInfo = JSON.stringify(a);
            localStorage.facebookAccessToken = o.facebookAccessToken;
            if( angular.mainScope.message.message ){ angular.mainScope.postMessage(); }

        })
}