Config.email =function(params) {
  var appName ='BeTealDev';
  var emailDomain ='betealdev.meteor.com';
  if(Config.ENV ==='prod') {
    appName ='BeTeal';
    emailDomain ='beteal.meteor.com';
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
      "apiKey": "todoseed",
      "username": "todoseed"
    }
  };
  return ret;
};