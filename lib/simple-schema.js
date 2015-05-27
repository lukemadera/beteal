/*
@toc
1. common
2. user
3. organization
0. init collections
*/

SimpleSchema.debug =true;   //TESTING


var autoValCreatedAt =function() {
  if(this.isInsert) {
    return moment().format('YYYY-MM-DD HH:mm:ssZ');
  }
  else if(this.isUpsert) {
    return {$setOnInsert: moment().format('YYYY-MM-DD HH:mm:ssZ')};
  }
  else {
    this.unset();
  }
};

var autoValMongoObjectId =function() {
  if(this.isInsert) {
    return new Mongo.ObjectID().toHexString();
  }
  else if(this.isUpsert) {
    return {$setOnInsert: new Mongo.ObjectID().toHexString()};
  }
  else {
    // this.unset();
  }
}

/**
Common
@toc 1.
*/
AddressSchema =new SimpleSchema({
  fullAddress: {
    type: String
  },
  lat: {
    type: Number,
    decimal: true
  },
  lng: {
    type: Number,
    decimal: true
  },
  street: {
    type: String,
    max: 100,
    optional: true
  },
  city: {
    type: String,
    max: 50
  },
  state: {
    type: String,
    //regEx: /^A[LKSZRAEP]|C[AOT]|D[EC]|F[LM]|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[ARW]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY]$/,
    optional: true
  },
  zip: {
    type: String,
    //regEx: /^[0-9]{5}$/,
    optional: true
  },
  country: {
    type: String
  }
});

ReviewsSchema =new SimpleSchema({
  userId: {
    type: String
  },
  rating: {
    type: Number
  },
  comment: {
    type: String
  },
  createdAt: {
    type: String,
    autoValue: autoValCreatedAt
  }
});

TagSchema =new SimpleSchema({
  _id: {
    type: String,
    // autoValue: autoValMongoObjectId
    optional: true   //not really optional but self-setting / validating..
  },
  tagId: {
    type: String
  },
  //only for editing / display purposes - (should) NOT saved on backend
  name: {
    type: String,
    optional: true
  },
  category: {
    type: String
  },
  status: {
    type: String
  },
  roleIds: {
    type: [String],
    optional: true
  },
  rating: {
    type: Number
  },
  comment: {
    type: String
  },
  createdAt: {
    type: String,
    // autoValue: autoValCreatedAt
    optional: true   //not really optional but self-setting / validating..
  },
  reviews: {
    type: [ReviewsSchema],
    optional: true
  }
});


/**
User
@toc 2.
*/
UserProfileSchema =new SimpleSchema({
  name:{
    type: String,
    optional: true
  }
});

UserSignupSchema = new SimpleSchema({
  email: {
    type: String
  },
  password: {
    type: String
  },
  name: {
    type: String
  }
});

UserLoginSchema = new SimpleSchema({
  email: {
    type: String
  },
  password: {
    type: String
  }
});

UserResetPasswordSchema = new SimpleSchema({
  password: {
    type: String
  }
});



/**
Organization
@toc 3.
*/
OrganizationSchema =new SimpleSchema({
  name: {
    type: String,
    optional: true    //required but using custom validation / sub-forms so can not set to required while using a "normal" autoform submission type?
  },
  teamMembers: {
    type: [Object],
    optional: true
  },
  "teamMembers.$.userId": {
    type: String
  },
  "teamMembers.$.role": {
    type: String,
    optional: true
  },
  locations: {
    type: [AddressSchema],
    optional: true
  },
  links: {
    type: [Object],
    optional: true
  },
  "links.$.url": {
    type: String
  },
  purpose: {
    type: String,
    optional: true
  },
  tags: {
    type: [TagSchema],
    optional: true
  },
  description: {
    type: String,
    optional: true
  },
  size: {
    type: Number,
    optional: true
  },
  visits: {
    type: Number,
    optional: true
  },
  visitDetails: {
    type: String,
    optional: true
  },
  createdAt: {
    type: String,
    autoValue: autoValCreatedAt
  },
  updatedAt: {
    type: String,
    optional: true
  }
});


//@toc 0.
//collections
// UsersCollection =new Meteor.Collection("users");   //use Meteor.users instead
NotificationsCollection =new Meteor.Collection("notifications");
OrganizationsCollection =new Meteor.Collection("organizations");
TagsCollection =new Meteor.Collection("tags");
PeopleCollection =new Meteor.Collection("people");

OrganizationsCollection.attachSchema(OrganizationSchema);