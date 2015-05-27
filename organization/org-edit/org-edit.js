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

        console.log('preSave: doc: ', doc);
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

      /**
      //@todo - switch schema for tags to an object with _id as the keys? That way order doesn't matter and this should be better for performance and simpler?
      //since breaking form in parts and filtering tags by category / status, not ALL tags are put in each form so the default $set will likely have the WRONG indices and will thus overwrite / remove tags from other categories! So need to actually look up the proper indices (by tag id)
      Have to do up to 3 SEPARATE queries - $set, $push, $pull (no $unset needed, just use $pull to remove). And the ORDER matters since push and pull will change the indices and we're updating by array index! So need to do:
      1. $set (which leaves indices unchanged)
      2. $pull (which removes items/indices)
      3. $push (which will add items/indices)
      */
      function updateTagsSetLocal(doc, docId, params) {
        if(doc.$set.tags !==undefined && doc.$set.tags.length) {
          console.log('docId: ', docId);
          var org =OrganizationsCollection.findOne({_id:docId});
          console.log('org.tags: ', org.tags);
          var ii, index1, key;

          function isEmptyObjectLocal(obj, params) {
            var key;
            var empty =true;
            for(key in obj) {
              if(hasOwnProperty.call(obj, key)) {
                empty =false;
                break;
              }
            }
            return empty;
          }

          function addPushLocal(tag, params) {
            if(doc.$push ===undefined) {
              doc.$push ={};
            }
            if(doc.$push['tags'] ===undefined) {
              doc.$push['tags'] ={
                $each: []
              }
            }
            doc.$push['tags'].$each.push(tag);
          }

          function addPullLocal(tag, params) {
            if(doc.$pull ===undefined) {
              doc.$pull ={
                tags: {
                  _id: {
                    $in: []
                  }
                }
              };
            }
            doc.$pull.tags._id.$in.push(tag._id);
          }

          var category =false, status =false;
          for(ii =0; ii<doc.$set.tags.length; ii++) {
            if(doc.$set.tags[ii]) {
              if(!category && doc.$set.tags[ii].category) {
                category =doc.$set.tags[ii].category;
              }
              if(!status && doc.$set.tags[ii].status) {
                status =doc.$set.tags[ii].status;
              }

              if(doc.$set.tags[ii]._id !==undefined) {
                console.log('doc.$set.tags[ii]._id: ', doc.$set.tags[ii]._id);
                index1 =nrArray.findArrayIndex(org.tags, '_id', doc.$set.tags[ii]._id, {});
                if(index1 >-1) {
                  var key ='tags.'+index1;
                  doc.$set[key] =doc.$set.tags[ii];
                }
                else {
                  addPushLocal(doc.$set.tags[ii], {});
                }
              }
              else {
                addPushLocal(doc.$set.tags[ii], {});
              }
            }
          }

          //pull
          for(ii =0; ii<org.tags.length; ii++) {
            //do NOT want to remove unless a match for the current type (category + status)   //@todo - un hardcode this and have the form / package pass back a list of ids to remove and just remove those. More robust and better for performance.
            if(org.tags[ii].category ===category && org.tags[ii].status ===status) {
              index1 =nrArray.findArrayIndex(doc.$set.tags, '_id', org.tags[ii]._id, {});
              //not found
              if(index1 <0) {
                addPullLocal(org.tags[ii], {});
              }
            }
          }
          delete doc.$set.tags;
          if(isEmptyObjectLocal(doc.$set, {})) {
            delete doc.$set;
          }
        }
        return doc;
      }

      if(docId) {
        doc.$set =preSave(doc.$set, {});
        doc =updateTagsSetLocal(doc, docId, {});
        var modifier =doc;
        console.log('modifier: ', JSON.stringify(modifier));
        //can NOT do BOTH $set and $push operations at same time apparently.. so break into two.
        var modifierPull =false;
        var modifierPush =false;
        if(modifier.$pull !==undefined) {
          modifierPull ={
            '$pull': EJSON.clone(modifier.$pull)
          };
          delete modifier.$pull;
        }
        if(modifier.$push !==undefined) {
          modifierPush ={
            '$push': EJSON.clone(modifier.$push)
          };
          delete modifier.$push;
        }
        //order matters here - FIRST set then pull then push
        if(modifier.$set !==undefined) {
          OrganizationsCollection.update({_id:docId}, modifier);
        }
        if(modifierPull) {
          console.log('modifierPull: ', JSON.stringify(modifierPull));
          OrganizationsCollection.update({_id:docId}, modifierPull);
        }
        if(modifierPush) {
          console.log('modifierPush: ', JSON.stringify(modifierPush));
          OrganizationsCollection.update({_id:docId}, modifierPush);
        }

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
  orgEdit.tagsFilterCategoryStatus =function(tags, category, status, params) {
    //strip out tags that are not proper category and status
    if(tags !==undefined && tags.length) {
      var ii;
      for(ii =(tags.length-1); ii>=0; ii--) {
        if(tags[ii].category !==category || tags[ii].status !==status) {
          tags =nrArray.remove(tags, ii);
        }
      }
    }
    return tags;
  };

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
      {
        key: "mission",
        title: "Mission",
        template: "orgEditMission",
        link: "org-edit/mission"+urlSuffix
      },
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