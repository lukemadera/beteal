/**
This is used across ALL sub pages / forms. But only certain pieces need to be set / init'ed for the subpages (basically just the stuff needed by the template helpers)
- initForm (need unique formId, etc.)
- getOrg
*/

orgEdit ={};

Meteor.methods({
  saveOrganization: function(doc, docId) {
    var ret ={code:0, msg:'', organization:{}};
    if(Meteor.isServer) {

      function preSave(doc, params) {
        doc =removeEmptyArrayItems(doc);

        if(doc.tags !==undefined && doc.tags.length) {
          var ii;
          for(ii =0; ii<doc.tags.length; ii++) {
            doc.tags[ii] =afTag.preSave(doc.tags[ii], {});
          }
        }

        console.log(doc);
        return doc;
      }

      function removeEmptyArrayItems(doc, params) {
        var keys =['locations', 'links', 'tags'];
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
        doc.$set =preSave(doc.$set, {});
        var modifier =doc;
        OrganizationsCollection.update({_id:docId}, modifier);
        ret.organization._id =docId;
      }
      else {
        if(doc.name ===undefined) {
          ret.code =1;
          ret.msg ='name is required';
        }
        else {
          doc =preSave(doc);
          OrganizationSchema.clean(doc);

          ret.organization._id =OrganizationsCollection.insert(doc);
        }
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
        console.log('orgEdit onSubmit: ', insertDoc, updateDoc, currentDoc);
        var self =this;
        //without this, it submits the form..
        self.event.preventDefault();
        self.event.stopPropagation();

        /**
        @param {Object} params
          @param {Object} org
            @param {String} _id
        */
        function goNextLocal(params) {
          var delay =0;
          //if first time save, need to add organization id to url and update all subpages accordingly
          var orgId =Router.current().params.query.organizationId;
          if(!orgId && params.org && params.org._id) {
            Router.current().params.query.organizationId =params.org._id;
            orgEdit.formSubpages(templateInstMain, {});
            delay =500;   //need to wait for subpages to update
          }

          setTimeout(function() {
            var retNav =lmSubpages.nav('next', {instid:saveVars.instid});
            if(!retNav.valid) {
              Router.go('/orgs');
            }
          }, delay);
        }

        function callbackLocal(error, result) {
          var msg;
          if(error) {
            msg =error;
            nrAlert.alert(msg);
            self.done(new Error(msg));
          }
          else if(!result || (result.code !==undefined && result.code !==0)) {
            if(result.msg !==undefined && result.msg) {
              msg =result.msg;
              nrAlert.alert(msg);
              self.done(new Error(msg));
            }
          }
          else {
            goNextLocal({org: result.organization});
            self.done();
          }
        }

        if(currentDoc._id) {
          Meteor.call("saveOrganization", updateDoc, currentDoc._id, function(error, result) {
            callbackLocal(error, result);
          });
        }
        else {
          Meteor.call("saveOrganization", insertDoc, false, function(error, result) {
            callbackLocal(error, result);
          });
        }

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
      {
        key: "values",
        title: "Values",
        template: "orgEditValues",
        link: "org-edit/values"+urlSuffix
      },
      // {
      //   key: "mission",
      //   title: "Mission",
      //   template: "orgEditMission",
      //   link: "org-edit/mission"+urlSuffix
      // },
      // {
      //   key: "skills-seeking",
      //   title: "Skills Desired",
      //   template: "orgEditSkillsSeeking",
      //   link: "org-edit/skills-seeking"+urlSuffix
      // }
    ];

    templateInst.subpages.set(subpages);

    // if(params.noReInstid ===undefined || !params.noReInstid) {
    if(1) {
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

      templateInst.optsSubpages.set(optsSubpages);
    }
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