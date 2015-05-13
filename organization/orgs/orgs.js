if(Meteor.isServer) {
  Meteor.publish('organizations', function() {
    return OrganizationsCollection.find();
  });
}

if(Meteor.isClient) {

  Template.orgs.helpers({
    organizations: function() {
      return OrganizationsCollection.find();
    }
  });
}