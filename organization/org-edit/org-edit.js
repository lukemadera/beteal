var orgEdit ={};

Meteor.methods({
  saveOrganization: function(doc, docId) {

    function removeEmptyLocations(doc, params) {
      console.log(doc);
      if(doc.locations !==undefined && doc.locations.length) {
        var ii;
        for(ii =(doc.locations.length-1); ii>=0; ii--) {
          if(doc.locations[ii] ===undefined || !doc.locations[ii]) {
            doc.locations =nrArray.remove(doc.locations, ii);
          }
        }
      }
      console.log(doc);

      return doc;
    }

    if(docId) {
      var modifier =doc;
      doc.$set =removeEmptyLocations(doc.$set);
      OrganizationsCollection.update({_id:docId}, modifier, function(error, result) {
        if(Meteor.isClient) {
          if(!error && result) {
            Router.go('/orgs');
          }
        }
      });
    }
    else {
      doc =removeEmptyLocations(doc);
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

  orgEdit.getOrg =function(templateInst, params) {
    var org;
    var orgId =Router.current().params.query.organizationId;
    if(orgId) {
      org =OrganizationsCollection.findOne({_id: orgId});
      org =orgEdit.formatOrg(org, {});
    }
    else {
      org =orgEdit.formatOrg({});
    }
    templateInst.org.set(org);
  };

  orgEdit.formatOrg =function(org, params) {
    return org;
  };

  Template.orgEdit.created =function() {
    var id1 ="orgEdit"+(Math.random() + 1).toString(36).substring(7);
    this.ids = new ReactiveVar({
      form: id1+"Form"
    });
    this.org =new ReactiveVar({});
  };

  Template.orgEdit.rendered =function() {
    orgEdit.getOrg(this, {});

    AutoForm.setDefaultTemplateForType('afArrayField', 'googleplace');
  };

  Template.orgEdit.helpers({
    organization: function() {
      return Template.instance().org.get();
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
}