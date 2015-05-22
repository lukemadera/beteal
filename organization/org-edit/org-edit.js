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
    // var ll;
    // org.xDisplay ={
    //   locations: []
    // };
    // if(org.locations ===undefined) {
    //   org.xDisplay.locations.push({
    //     name: 'locations.0'
    //   });
    // }
    // else {
    //   for(ll =0; ll<org.locations.length; ll++) {
    //     org.xDisplay.locations.push({
    //       name: 'locations.'+ll
    //     });
    //   }
    // }
    return org;
  };

  /*
  orgEdit.formArrayAdd =function(templateInst, key, params) {
    var org =templateInst.org.get();
    var lastIndex =(org[key].length -1);
    
    //see if last one is not blank (do not allow adding if so)
    var valid =true;
    //not working - new form values are not updated - need to use autoform get field value function to get updated ones?
    // if(key ==='locations') {
    //   if(org[key][lastIndex].fullAddress ===undefined || !org[key][lastIndex].fullAddress) {
    //     valid =false;
    //   }
    // }

    if(valid) {
      //add to display
      org.xDisplay[key].push({
        name: key+'.'+(lastIndex +1).toString()
      });

      //add to value
      if(key ==='locations') {
        org[key].push({});
      }
      else {
        org[key].push('');
      }
    }
    console.log(JSON.stringify(org));
    templateInst.org.set(org);
  };

  orgEdit.formArrayRemove =function(templateInst, keyName, params) {
    var org =templateInst.org.get();
    console.log(JSON.stringify(org));

    var formId =templateInst.ids.get().form;

    var posDot =keyName.lastIndexOf('.');
    var index =parseInt(keyName.slice((posDot+1), keyName.length), 10);
    var key =keyName.slice(0, posDot);

    //first have to update all values
    var ii, curKeyName;
    for(ii =0; ii<org[key].length; ii++) {
      curKeyName =key+'.'+ii;
      console.log(curKeyName, AutoForm.getFieldValue(curKeyName, formId));
      org[key][ii] =AutoForm.getFieldValue(curKeyName, formId);
    }

    org[key] =nrArray.remove(org[key], index);
    //have to rename the name key for xDisplay - shift all down 1
    for(ii =(index+1); ii<org.xDisplay[key].length; ii++) {
      org.xDisplay[key][ii].name =key+'.'+(ii-1);
    }
    org.xDisplay[key] =nrArray.remove(org.xDisplay[key], index);

    console.log(JSON.stringify(org));
    templateInst.org.set(org);
  };
  */

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

  Template.orgEdit.events({
    // 'click .org-edit-location-add': function(evt, template) {
    //   orgEdit.formArrayAdd(template, 'locations', {});
    // },
    // 'click .org-edit-location-remove': function(evt, template) {
    //   orgEdit.formArrayRemove(template, this.name, {});
    // }
  });
}