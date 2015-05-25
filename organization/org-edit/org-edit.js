orgEdit ={};

Meteor.methods({
  saveOrganization: function(doc, docId) {

    function removeEmptyArrayItems(doc, params) {
      var keys =['locations', 'links'];
      var kk, ii, key;
      for(kk =0; kk<keys.length; kk++) {
        key =keys[kk];
        if(doc[key] !==undefined && doc[key].length) {
          for(ii =(doc[key].length-1); ii>=0; ii--) {
            if(doc[key][ii] ===undefined || !doc[key][ii]) {
              doc[key] =nrArray.remove(doc[key], ii);
            }
          }
        }
      }
      return doc;
    }

    if(docId) {
      var modifier =doc;
      doc.$set =removeEmptyArrayItems(doc.$set);
      OrganizationsCollection.update({_id:docId}, modifier, function(error, result) {
        if(Meteor.isClient) {
          if(!error && result) {
            Router.go('/orgs');
          }
        }
      });
    }
    else {
      doc =removeEmptyArrayItems(doc);
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

  orgEdit.created =function(templateInst, key, params) {
    var id1 =key+(Math.random() + 1).toString(36).substring(7);
    templateInst.ids = new ReactiveVar({
      form: id1+"Form"
    });
    templateInst.org =new ReactiveVar({});

    templateInst.subpages =new ReactiveVar([]);
  };

  orgEdit.init =function(templateInst, params) {
    orgEdit.getOrg(templateInst, {});
    orgEdit.formSubpages(templateInst, {});

    AutoForm.setDefaultTemplateForType('afArrayField', 'type');
  };

  orgEdit.getAFMethod =function(templateInst, thisObj, params) {
    // var org =templateInst.org.get();
    var orgId =Router.current().params.query.organizationId;
    if(orgId) {
      return 'method-update';
    }
    else {
      return 'method';
    }
  };

  orgEdit.formSubpages =function(templateInst, params) {
    var subpages =[
      {
        title: "Basic",
        template: "orgEditBasic"
      },
      {
        title: "Locations",
        template: "orgEditLocations"
      },
      {
        title: "Tags",
        template: "orgEditTags"
      }
    ];
    templateInst.subpages.set(subpages);
  };

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
    orgEdit.created(this, 'orgEdit', {});
  };

  Template.orgEdit.rendered =function() {
    orgEdit.init(this, {});
  };

  Template.orgEdit.helpers({
    organization: function() {
      return Template.instance().org.get();
    },
    afMethod: function() {
      return orgEdit.getAFMethod(Template.instance(), this, {});
    },
    ids: function() {
      return Template.instance().ids.get();
    },
    subpages: function() {
      return Template.instance().subpages.get();
    },
    optsSubpages: function() {
      return {
        contents: false
      };
    }
  });
}