if(Meteor.isServer) {
  Meteor.publish('organizations', function() {
    return OrganizationsCollection.find();
  });
}

if(Meteor.isClient) {

  Template.orgs.helpers({
    organizations: function() {
      var orgs =OrganizationsCollection.find().fetch();
      var ii;
      for(ii =0; ii<orgs.length; ii++) {
        orgs[ii].xDisplay ={
          location: orgs[ii].locations[0]
        };
      }
      console.log(orgs);
      return orgs;
    }
  });
}