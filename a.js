/**
 * Created with PyCharm.
 * User: koba
 * Date: 2013/03/02
 * Time: 14:19
 * To change this template use File | Settings | File Templates.
 */

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