/**

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

afTagSchema = new SimpleSchema({
  name: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 10
  },
  comment: {
    type: String
  }
});

var VAL ={};    //one per instid

AutoForm.addInputType("tag", {
  template: "afTag",
  valueIn: function(val) {
    //will convert to display value later after set / extend opts
    return val;
  },
  valueOut: function() {
    var instid =this.attr('data-schema-key');
    return VAL[instid];
  }
});

var afTag ={
  init: function(templateInst, params) {
    var optsDefault ={
    };
    var xx;
    templateInst.opts =EJSON.clone(templateInst.data.atts.opts);
    if(templateInst.opts ===undefined) {
      templateInst.opts =EJSON.clone(optsDefault);
    }
    else {
      //extend
      for(xx in optsDefault) {
        if(templateInst.opts[xx] ===undefined) {
          templateInst.opts[xx] =optsDefault[xx];
        }
      }
    }

    var val =templateInst.data.value;
    var instid =templateInst.data.atts['data-schema-key'];
    VAL[instid] =val;

    afTag.getTag(templateInst, val, {});
  },

  // initForm: function(templateInst, params) {
  //   var formId =templateInst.get('ids').form;
  //   //add on submit hook
  //   AutoForm.addHooks(formId, {
  //     onSubmit: function(insertDoc, updateDoc, currentDoc) {
  //       var self =this;

  //       //without this, it submits the form..
  //       self.event.preventDefault();
  //       self.event.stopPropagation();



  //       this.done();
  //       return false;
  //     }
  //   });
  // }

  getTag: function(templateInst, val, params) {
    var tag ={};
    if(val && val.tagId) {
      var tag1 =TagsCollection.findOne({_id: val.tagId});
      tag ={
        name: tag1.name,
        rating: val.rating,
        comment: val.comment
      };
    }
    templateInst.tag.set(tag);
  },

  updateVal: function(templateInst, key, val, params) {
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
        val1.tagId ='__'+val.name;
      }
      this.hide(templateInst, {});
    }
    VAL[instid] =val1;
  },

  getPredictions: function(templateInst, val, params) {
    var predictions =[];
    var query ={
      name: {
        $regex: '^'+val,
        $options: 'i'
      }
    };
    predictions =TagsCollection.find(query, {fields: {_id:1, name:1}}).fetch();
    //if none, show the val for allowing creation
    if(!predictions.length) {
      predictions =[
        {
          name: val,
          _id: ''
        }
      ];
    }
    this.show(templateInst, {});
    templateInst.predictions.set(predictions);
  },

  hide: function(templateInst, params) {
    var classes =templateInst.classes.get();
    classes.predictions ='hidden';
    templateInst.classes.set(classes);
  },

  show: function(templateInst, params) {
    var classes =templateInst.classes.get();
    classes.predictions ='visible';
    templateInst.classes.set(classes);
  }
};

Template.afTag.created =function() {
  this.opts ={};

  var id1 ="afTag"+(Math.random() + 1).toString(36).substring(7);
  this.ids = new ReactiveVar({
    form: id1+"Form"
  });

  this.tag =new ReactiveVar({});

  this.predictions =new ReactiveVar([]);
  this.classes =new ReactiveVar({
    predictions: 'hidden'
  });
};

Template.afTag.rendered =function() {
  afTag.init(this, {});
};

Template.afTag.helpers({
  //fix to avoid error for passed in object
  // - https://github.com/aldeed/meteor-autoform-bs-datepicker/issues/3
  // - https://github.com/aldeed/meteor-autoform-bs-datepicker/commit/3977aa69b61152cf8c0f731a11676b087d2ec9df
  atts: function() {
    var atts =EJSON.clone(this.atts);
    delete atts.opts;
    return atts;
  },
  classes: function() {
    return Template.instance().classes.get();
  },
  tag: function() {
    return Template.instance().tag.get();
  },
  ids: function() {
    return Template.instance().ids.get();
  },
  predictions: function() {
    return Template.instance().predictions.get();
  }
});

Template.afTag.events({
  'blur .bt-autoform-tag-rating-input': function(evt, template) {
    afTag.updateVal(template, 'rating', evt.target.value, {});
  },
  'blur .bt-autoform-tag-comment-input': function(evt, template) {
    afTag.updateVal(template, 'comment', evt.target.value, {});
  },
  'keyup .bt-autoform-tag-name-input': function(evt, template) {
    afTag.getPredictions(template, evt.target.value, {});
  },
  'click .bt-autoform-tag-prediction-item': function(evt, template) {
    afTag.updateVal(template, 'name', this, {});
  }
});