/**
@toc
afTag.
  12. preSave
  13. formRatingOpts
1. AutoForm.addInputType("tag",..
afTagPrivate.
  2. init
  3. getTag
  4. updateVal
  5. getPredictions
  6. hide
  7. show
Template.afTag.
  8. created
  9. rendered
  10. helpers
  11. events


Requires "TagsCollection" subscription to be made outside this package!

Takes a tag (for an organization or person) with a tagId key and then uses that to lookup the tags.name text and display it and allow editing it (if user types in a tag name, will look up the corresponding tags.id and set that for the tagId).
Also handles setting the category and status fields.
So the input and output format are as follows but only a tag name, rating, and comment field show up as user input.
{
  "_id":"{String} 123l4k234l",
  "tagId": "{String} [Matches a tags._id field]",
  "category": "{String} [One of: 'values', 'mission', 'skills', 'resources']",
  "status": "{String} [One of 'have' if this represents the current state or 'seeking' if looking to connect with other people who have this or 'both']",
  "__commentRolesIds": "Each array item matches an organizations.roles._id field. If set, this tag applies ONLY to the specified roles and not organization wide.",
  "roleIds": [],
  "rating": "{Number} [1 to 10 on the priority / importance for this tag.]",
  "comment": "{String} [used as qualitative reasoning to explain / back up the quantitative rating]",
  "createdAt": "{String} [timestamp YYYY-MM-DD HH:mm:ssZ] 2013-06-13 15:30:00-07:00",
}


@param {Object} [atts.opts]
*/

afTag ={};
afTag.newTagPrefix ='__';
var afTagPrivate ={};

Meteor.methods({
  createNewTag: function(tagName, params) {
    var ret ={tagId: false};
    if(Meteor.isServer) {
      //ensure does not already exist
      var tag =TagsCollection.findOne({name:tagName});
      if(tag) {
        ret.tagId =tag._id;
      }
      //create new
      else {
        var tagId =TagsCollection.insert({name:tagName});
        ret.tagId =tagId;
      }
    }
    return ret;
  }
});

/**
@toc 12.
*/
afTag.preSave =function(val, params) {
  //remove any temporary / form input only fields that should NOT actually be saved on the backend
  if(val.name !==undefined) {
    delete val.name;
  }

  if(val._id ===undefined) {
    val._id =new Mongo.ObjectID().toHexString();
  }
  if(val.createdAt ===undefined) {
    val.createdAt =moment().format('YYYY-MM-DD HH:mm:ssZ');
  }

  //check if a new tag that needs to be created
  if(val.tagId ===undefined) {
    if(val.rating !==undefined && val.comment !==undefined) {
      // nrAlert.alert("tag is required");
      console.log("tag is required");
    }
  }
  else {
    if(val.tagId.slice(0, afTag.newTagPrefix.length) ===afTag.newTagPrefix) {
      var newTagName =val.tagId.slice((afTag.newTagPrefix.length), val.tagId.length);
      var result =Meteor.call("createNewTag", newTagName);
      if(result && result.tagId) {
        val.tagId =result.tagId;
      }
      else {
        console.log("error saving new tag: "+newTagName, result);
      }

      // Meteor.call("createNewTag", newTagName, function(error, result) {
      //   if(!error && result) {
      //     val.tagId =result.tagId;
      //     console.log('createNewTag: result.tagId: ', val.tagId, result);
      //   }
      //   else {
      //     nrAlert.alert("error saving new tag: "+newTagName);
      //   }
      // });
    }
  }
  return val;
};


if(Meteor.isClient) {
  var VAL ={};    //one per instid

  /**
  Used to link autocomplete opts.instid to templateInst to be able to go back and forth (for autocomplete API calls / callback function that pass back the instance id and need to use that to get the proper template)
  @example
  afTagPrivate.instAutocomplete ={
    'inst1': {
      templateInst: templateInst1
    },
    'inst2': {
      templateInst: templateInst2
    }
  };
  */
  afTagPrivate.instAutocomplete ={};

  /**
  @toc 13.
  */
  afTag.formRatingOpts =function(params) {
    var ratings =[1, 2, 3, 4, 5];
    var optsRatings =ratings.map(function(val) {
      return {
        value: val,
        label: val
      }
    });
    return optsRatings;
  };

  /**
  @toc 1.
  */
  AutoForm.addInputType("tag", {
    template: "afTag",
    valueIn: function(val) {
      //will convert to display value later after set / extend opts
      return val;
    },
    valueOut: function() {
      var instid =this.attr('data-schema-key');
      //can create new tag and get id on backend from here - no async?
      return VAL[instid];
    }
  });

  /**
  @toc 2.
  */
  afTagPrivate.init =function(templateInst, params) {
    var optsDefault ={
    };
    var xx, opts;
    opts =EJSON.clone(templateInst.data.atts.opts);
    if(opts ===undefined) {
      opts =EJSON.clone(optsDefault);
    }
    else {
      //extend
      for(xx in optsDefault) {
        if(opts[xx] ===undefined) {
          opts[xx] =optsDefault[xx];
        }
      }
    }
    templateInst.opts =opts;

    var val =templateInst.data.value;

    if(typeof(val) ==='string') {
      val ={
        name: val
      };
    }
    if(opts.category !==undefined && val.category ===undefined) {
      val.category =opts.category;
    }
    if(opts.status !==undefined && val.status ===undefined) {
      val.status =opts.status;
    }
    val =afTagPrivate.getTag(templateInst, val, {});

    var instid =templateInst.data.atts['data-schema-key'];
    VAL[instid] =val;

    //has to be AFTER VAL[instid] is set
    if(val.name && val.tagId) {
      afTagPrivate.updateVal(templateInst, 'name', {_id:val.tagId, name:val.name}, {});
    }

    // afTagPrivate.filterCategoryStatus(templateInst, val, opts.category, opts.status, {});
  };

  /**
  */
  afTagPrivate.destroy =function(templateInst, params) {
    //remove instid id key
    var xx;
    for(xx in afTagPrivate.instAutocomplete) {
      if(afTagPrivate.instAutocomplete[xx].templateInst ===templateInst) {
        delete afTagPrivate.instAutocomplete[xx];
        break;
      }
    }
  };

  /**
  @toc 3.
  */
  afTagPrivate.getTag =function(templateInst, val, params) {
    if(val && val.tagId) {
      var tag1 =TagsCollection.findOne({_id: val.tagId});
      if(tag1 && tag1.name) {
        val.name =tag1.name;
      }
    }
    return val;
  };

  /**
  @toc 4.
  @param {Object} params
    @param {Boolean} [noSetAutocomplete] True to NOT update autcomplete val (to avoid endless loop if this function is being called from the autocomplete value being updated there)
  */
  afTagPrivate.updateVal =function(templateInst, key, val, params) {
    var instid =templateInst.data.atts['data-schema-key'];
    var val1 =VAL[instid];
    if(key ==='rating' || key ==='comment') {
      val1[key] =val;
    }
    else if(key ==='name') {
      if(val._id) {
        val1.tagId =val._id;
      }
      else {
        val1.tagId =afTag.newTagPrefix+val.name;
      }

      if(params.noSetAutocomplete ===undefined || !params.noSetAutocomplete) {
        var optsAutocomplete =templateInst.optsAutocomplete.get();
        lmAfAutocomplete.setVals({value:val1.tagId, name:val1.name}, {optsInstid:optsAutocomplete.instid});
      }

      // //update UI too
      // // templateInst.data.value.name =val.name;
      // var ele =templateInst.find('input.bt-autoform-tag-name-input');
      // ele.value =val.name;

      // this.hide(templateInst, {});
    }
    VAL[instid] =val1;
  };

  /**
  @toc 5.5.
  */
  afTagPrivate.getPredictions1 =function(name, params) {
    var ret ={predictions:[]};
    var query ={
      name: {
        $regex: '^'+name,
        $options: 'i'
      }
    };
    var predictions1 =TagsCollection.find(query, {fields: {_id:1, name:1}}).fetch();
    ret.predictions =predictions1.map(function(obj) {
      return {
        value: obj._id,
        name: obj.name
      }
    });
    return ret;
  };

  afTagPrivate.updateValAutocomplete =function(instid, val, params) {
    if(afTagPrivate.instAutocomplete[instid] !==undefined) {
      templateInst =afTagPrivate.instAutocomplete[instid].templateInst;
      afTagPrivate.updateVal(templateInst, 'name', {_id:val.value, name:val.name}, {noSetAutocomplete:true});
    }
  };

  // /**
  // @toc 5.
  // */
  // afTagPrivate.getPredictions =function(templateInst, val, params) {
  //   var predictions =this.getPredictions1(val, {}).predictions;
  //   this.show(templateInst, {});
  //   templateInst.predictions.set(predictions);
  // };

  // /**
  // @toc 6.
  // */
  // afTagPrivate.hide =function(templateInst, params) {
  //   var classes =templateInst.classes.get();
  //   classes.predictions ='hidden';
  //   templateInst.classes.set(classes);
  // };

  // /**
  // @toc 7.
  // */
  // afTagPrivate.show =function(templateInst, params) {
  //   var classes =templateInst.classes.get();
  //   classes.predictions ='visible';
  //   templateInst.classes.set(classes);
  // };

  /**
  @toc 8.
  */
  Template.afTag.created =function() {
    this.opts ={};

    var id1 ="afTag"+(Math.random() + 1).toString(36).substring(7);
    // this.ids = new ReactiveVar({
    //   form: id1+"Form"
    // });

    var instid1 =id1+"Autocomplete";
    this.optsAutocomplete =new ReactiveVar({
      instid: instid1,
      newNamePrefix: afTag.newTagPrefix,
      getPredictions: afTagPrivate.getPredictions1,
      onUpdateVals: afTagPrivate.updateValAutocomplete,
      createNew: true
    });
    afTagPrivate.instAutocomplete[instid1] ={
      templateInst: this
    };

    // this.predictions =new ReactiveVar([]);
    // this.classes =new ReactiveVar({
    //   predictions: 'hidden'
    // });
  };

  /**
  @toc 9.
  */
  Template.afTag.rendered =function() {
    //LAME! need timeout otherwise current value sometimes is not set yet..   //@todo - fix this
    var templateInst =this;
    afTagPrivate.init(templateInst, {});
    setTimeout(function() {
      afTagPrivate.init(templateInst, {});
    }, 750);
    // this.autorun(function() {
    //   afTagPrivate.init(Template.instance(), {});
    // });
  };

  /**
  */
  Template.afTag.destroyed =function() {
    afTagPrivate.destroy(this, {});
  };

  /**
  @toc 10.
  */
  Template.afTag.helpers({
    //fix to avoid error for passed in object
    // - https://github.com/aldeed/meteor-autoform-bs-datepicker/issues/3
    // - https://github.com/aldeed/meteor-autoform-bs-datepicker/commit/3977aa69b61152cf8c0f731a11676b087d2ec9df
    atts: function() {
      var atts =EJSON.clone(this.atts);
      delete atts.opts;
      return atts;
    },
    schemaNames: function() {
      //dynamically form input / schema names for this array index item for the parent / main / only form since can NOT use nested form with separate schema here (nested form seems to mess things up and the whole page is reloaded / form is submitted..)
      var atts =EJSON.clone(this.atts);
      if(atts.opts) {
        delete atts.opts;
      }
      var prefix =atts.name+'.';
      var names ={
        name: prefix+'name',
        rating: prefix+'rating',
        comment: prefix+'comment'
      };
      return names;
    },
    // classes: function() {
    //   return Template.instance().classes.get();
    // },
    // ids: function() {
    //   return Template.instance().ids.get();
    // },
    // predictions: function() {
    //   return Template.instance().predictions.get();
    // },
    optsAutocomplete: function() {
      return Template.instance().optsAutocomplete.get();
    },
    optsRatings: function() {
      return afTag.formRatingOpts({});
    }
  });

  /**
  @toc 11.
  */
  Template.afTag.events({
    'blur .bt-autoform-tag-rating-input': function(evt, template) {
      afTagPrivate.updateVal(template, 'rating', evt.target.value, {});
    },
    'blur .bt-autoform-tag-comment-input': function(evt, template) {
      afTagPrivate.updateVal(template, 'comment', evt.target.value, {});
    },
    // 'keyup .bt-autoform-tag-name-input': function(evt, template) {
    //   afTagPrivate.getPredictions(template, evt.target.value, {});
    // },
    // 'click .bt-autoform-tag-prediction-item': function(evt, template) {
    //   afTagPrivate.updateVal(template, 'name', this, {});
    // }
  });
}