Config.email =function(params) {
  var appName ='BeTealDev';
  var emailDomain ='betealdev.meteor.com';
  if(Config.ENV ==='prod') {
    appName ='BeTeal';
    emailDomain ='beteal.org';
  }
  var ret ={
    "addresses": {
      "contact": {
        "name": appName+" Contact",
        "email": "contact@"+emailDomain
      },
      "notify": {
        "name": appName+" Notification",
        "email": "notify@"+emailDomain
      }
    },
    "mandrill": {
      "apiKey": "8DYqpq74xKAb2jYdCoCQ2A",
      "username": "lukem123+betealdev@gmail.com"
    }
  };
  if(Config.ENV ==='prod') {
    ret.mandrill.apiKey ="lIAlj60lxJz6IPP2rQvvLQ";
    ret.mandrill.username ="lukem123+beteal@gmail.com";
    ret.domainHost ='http://'+emailDomain;
  }
  return ret;
};