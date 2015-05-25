/**
This is used across ALL sub pages / forms. But only certain pieces need to be set / init'ed for the subpages (basically just the stuff needed by the template helpers)
- initForm (need unique formId, etc.)
- getOrg
*/

orgEdit ={};

Meteor.methods({
  saveOrganization: function(doc, docId) {
    var ret ={};
    if(Meteor.isServer) {

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
        OrganizationsCollection.update({_id:docId}, modifier);
      }
      else {
        doc =removeEmptyArrayItems(doc);
        OrganizationSchema.clean(doc);

        OrganizationsCollection.insert(doc);
      }
    }
    return ret;
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
  orgEdit.initForm =function(templateInst, params) {
    //need to get main template in case not already in parent / main one
    var templateInstMain =orgEdit.getMainTemplate();
    var saveVars ={
      formId: templateInst.ids.get().form,
      instid: templateInstMain.optsSubpages.get().instid
    };
    AutoForm.addHooks(saveVars.formId, {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        var self =this;
        //without this, it submits the form..
        self.event.preventDefault();
        self.event.stopPropagation();

        function goNextLocal(params) {
          // Router.go('/orgs');
          var retNav =lmSubpages.nav('next', {instid:saveVars.instid});
          if(!retNav.valid) {
            Router.go('/orgs');
          }
        }

        if(currentDoc._id) {
          Meteor.call("saveOrganization", updateDoc, currentDoc._id, function(error, result) {
            if(!error && result) {
              goNextLocal({});
            }
          });
        }
        else {
          Meteor.call("saveOrganization", insertDoc, false, function(error, result) {
            if(!error && result) {
              goNextLocal({});
            }
          });
        }

        self.done();
        return false;
      }
    }, true);

    AutoForm.setDefaultTemplateForType('afArrayField', 'type');
  };

  orgEdit.created =function(templateInst, key, params) {
    var id1 =key+(Math.random() + 1).toString(36).substring(7);
    templateInst.ids = new ReactiveVar({
      form: id1+"Form"
    });
    templateInst.org =new ReactiveVar({});

    if(key ==='orgEdit') {
      templateInst.subpages =new ReactiveVar([]);
      templateInst.optsSubpages =new ReactiveVar({});
    }
  };

  orgEdit.init =function(templateInst, key, params) {
    orgEdit.getOrg(templateInst, {});
    orgEdit.initForm(templateInst, {});

    if(key ==='orgEdit') {
      orgEdit.formSubpages(templateInst, {});
    }
  };

  orgEdit.getMainTemplate =function(params) {
    var view =Blaze.currentView;
    if(view.name !=="Template.orgEdit") {
      //get parent template instance if not on correct one - http://stackoverflow.com/questions/27949407/how-to-get-the-parent-template-instance-of-the-current-template
      while (view && view.name !=="Template.orgEdit") {
        view = view.parentView;
      }
    }
    return view.templateInstance();
  };

  orgEdit.formSubpages =function(templateInst, params) {
    var orgId =Router.current().params.query.organizationId;
    var urlSuffix ='';
    if(orgId) {
      urlSuffix ='?organizationId='+orgId;
    }
    var subpages =[
      {
        key: "basic",
        title: "Basic",
        template: "orgEditBasic",
        link: "org-edit/basic"+urlSuffix
      },
      {
        key: "locations",
        title: "Locations",
        template: "orgEditLocations",
        link: "org-edit/locations"+urlSuffix
      },
      // {
      //   key: "tags",
      //   title: "Tags",
      //   template: "orgEditTags",
      //   link: "org-edit/tags"+urlSuffix
      // }
    ];

    // var optsSubpages =templateInst.optsSubpages.get();
    var optsSubpages ={
      // showHeader: false,
      // showProgress: false
    }
    optsSubpages.instid ='orgEditSubpages'+(Math.random() + 1).toString(36).substring(7);
    var curSubpage =Router.current().params.subpage;
    if(curSubpage) {
      optsSubpages.defaultPageKey =curSubpage;
    }

    templateInst.subpages.set(subpages);
    templateInst.optsSubpages.set(optsSubpages);
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
    orgEdit.init(this, 'orgEdit', {});
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
      return Template.instance().optsSubpages.get();
    }
  });
}