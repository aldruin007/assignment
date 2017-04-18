angular.module('assignment.services', [])

.factory('OauthService', function($q) {
  return {
    startsWith: function (str, pattern){
      return str.indexOf(pattern) === 0;
    },
    setProvider: function(provider) {
      this.provider = provider;
    },
    openInBrowser: function(resolve, reject) {
      var browserRef = cordova.InAppBrowser.open(this.provider.getOauthUrl(), '_self', 'location=no');

      browserRef.addEventListener('loadstart', (function(event) {
        if(!this.startsWith(event.url, this.provider.getCallbackUrl())) {
          return;
        }

        var requestToken = this.provider.parseToken(event.url);

        this.provider.getUserData(requestToken)
          .then(function(data) {
            resolve(data);
          }).catch(function() {
            reject();
          });

        browserRef.close();
      }).bind(this));
    },
    login: function() {
      if(typeof this.provider == 'undefined') {
        throw new Error('You should set provider first.');
      }

      return $q(this.openInBrowser.bind(this));
    }
  };
})

.factory('VkontakteProvider', function($http) {
  var clientId = '5988426';
  var callbackUrl = 'https://oauth.vk.com/blank.html';
  var oauthUrl = 'https://oauth.vk.com/authorize?client_id=' + clientId +
    '&redirect_uri=' + callbackUrl + '&display=touch&response_type=token';

  return {
    getOauthUrl: function() {
      return oauthUrl;
    },
    getCallbackUrl: function() {
      return callbackUrl;
    },
    parseToken: function(url) {
      var res = url.match(/access_token=(.*)&expires_in/);
      return res[1];
    },
    getUserData: function(token) {
      return $http({
        url: 'https://api.vk.com/method/account.getProfileInfo?access_token=' + token
      }).then(function(response) {
        var data = response.data.response;
        return data.first_name + ' ' + data.last_name;
      });
    }
  };
})

.factory('MailruProvider', function($http) {
  var clientId = '753448';
  var privateKey = '29f449b5218a69d0af2d45838fdfde4a';
  var callbackUrl = 'https://connect.mail.ru/oauth/success.html';
  var oauthUrl = 'https://connect.mail.ru/oauth/authorize?client_id=' + clientId +
    '&redirect_uri=' + callbackUrl + '&response_type=token';
  var uid;

  return {
    getOauthUrl: function() {
      return oauthUrl;
    },
    getCallbackUrl: function() {
      return callbackUrl;
    },
    parseToken: function(url) {
      uid = url.match(/&x_mailru_vid=(.*)/)[1];

      var res = url.match(/&access_token=(.*)&token_type/);
      return res[1];
    },
    getUserData: function(token) {
      // Generating MD5 sign of request
      var sign = md5(
        uid + 'app_id=' + clientId +
        'method=users.getInfosession_key=' + token + privateKey
      );

      return $http({
        url: 'http://www.appsmail.ru/platform/api?method=users.getInfo&app_id=' +
          clientId + '&session_key=' + token + '&sig=' + sign
      }).then(function(response) {
        var data = response.data[0];
        return data.first_name + ' ' + data.last_name;
      });
    }
  };
});
