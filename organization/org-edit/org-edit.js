Meteor.methods({
  saveOrganization: function(doc, docId) {

    if(docId) {
      var modifier =doc;
      OrganizationsCollection.update({_id:docId}, modifier, function(error, result) {
        if(Meteor.isClient) {
          if(!error && result) {
            Router.go('/orgs');
          }
        }
      });
    }
    else {
      OrganizationSchema.clean(doc);

      OrganizationsCollection.insert(doc, function(error, result) {
        if(Meteor.isClient) {
          if(!error && result) {
            Router.go('/orgs');
          }
        }
      });
    }
  }
});

if(Meteor.isServer) {
  Meteor.publish('organization', function(organizationId) {
    if(organizationId) {
      return OrganizationsCollection.find({_id: organizationId});
    }
    else {
      this.ready();
      return false;
    }
  });
}

if(Meteor.isClient) {
  Template.orgEdit.created =function() {
    var id1 ="orgEdit"+(Math.random() + 1).toString(36).substring(7);
    this.ids = new ReactiveVar({
      form: id1+"Form"
    });
  };

  Template.orgEdit.helpers({
    organization: function() {
      if(this.organizationId) {
        return OrganizationsCollection.findOne({_id: this.organizationId});
      }
      else {
        return {}
      }
    },
    afMethod: function() {
      if(this.organizationId) {
        return 'method-update';
      }
      else {
        return 'method';
      }
    },
    ids: function() {
      return Template.instance().ids.get();
    }
  });

  Template.orgEdit.events({
  });
}