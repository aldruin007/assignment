angular.module('assignment.controllers', [])

.controller('LoginCtrl', function($scope, $state, OauthService, VkontakteProvider, MailruProvider) {
  var goToHomepage = function(name) {
    $state.go('home', {name: name});
  };

  $scope.loginWithVk = function() {
    OauthService.setProvider(VkontakteProvider);
    OauthService.login()
      .then(goToHomepage);
  };
  $scope.loginWithMailru = function() {
    OauthService.setProvider(MailruProvider);
    OauthService.login()
      .then(goToHomepage);
  };
})

.controller('HomeCtrl', function($scope, $stateParams) {
  $scope.name = $stateParams.name;
});
