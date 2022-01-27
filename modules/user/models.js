const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

// {
//   "loginType" : "",
//   "role" : "",
//   "fname" : "",
//   "lname" : "",
//    "name" :"",   
//   "email" : "",
//   "phone" : 914578145781,
//   "username" : "",
//   "signupdate": ""
//   }
const user = {
  _id: { type: objectId, auto: true },
  fname: String,
  lname: String,
  name: String,
  role: {
    type: String,
    enum: ["artist", "business", "institution", "enthusiast"],
  },
  primaryRole: String,
  secondaryRole: [String],
  username: [String],
  linkedUsers: [String],
  password: String,
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  countryCode: Number,
  phone: {
    type: Number,
    min: [11, "Please enter a valid Mobile Number"],
  },
  emailVerified: { type: Boolean, default: 0 },
  phoneVerified: { type: Boolean, default: 0 },
  isTCAccepted: { type: Boolean, default: 0 },
 
  emailSecurityCode: Number,
  phoneSecurityCode: Number,
  like: { type: String},
  comment: [{ type: String}],
  share: [{ type: String}],
  createdAt: Date,
  updatedAt: Date,
  status: { type: Boolean, default: 1 },
};
const userSchema = new Schema(user, { versionKey: false, timestamps: true });

const registration = {
    _id: { type: objectId, auto: true },
    fname: String,
    lname: String,
    email: String,
    phone: Number,
    userCategory: {
        type: String,
        enum: ["Artist"]
    },
    loginType: String,
    emailVerified: { type: Boolean, default: 0 },
    phoneVerified: { type: Boolean, default: 0 },
    username: String,
    password: String,
    followers: [String],
    following: [String],
    city: String,
    continent_code: Number,
    country: String,
    countryCallingCode: Number,
    country_capital: String,
    currency: String,
    ip: String,
    languages: [String],
    latitude: String,
    longitude: String,
    org: String,
    postal: Number,
    region: String,
    timezone: String,
    emailSecurityCode: Number,
    phoneSecurityCode: Number,
    status: { type: Boolean, default: 1 }
}
const registrationsSchema = new Schema(registration, { versionKey: false, timestamps: true });

// User Details
const userDetails = {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  about: String,
  address: String,
  state: String,
  ip: String,
  city: String,
  region: String,
  region_code: String,
  country: String,
  country_name: String,
  country_code: String,
  country_capital: String,
  postal: String,
  latitude: Number,
  longitude: Number,
  timezone: String,
  country_calling_code: Number,
  languages: [String],
  disciplines: [String],
  featuresandpress: [String],
  currency: String,
  org: String,
  createdAt: Date,
  updatedAt: Date,
};
const userDetailsSchema = new Schema(userDetails, { versionKey: false, timestamps: true });


// User Group
const userGroup = {
    _id: { type: objectId, auto: true },
    userId: { type: objectId, required: true },
    group: String,
    subGroup: [String],
    createdAt: Date,
    updatedAt: Date
};
const userGroupSchema = new Schema(userGroup, { versionKey: false, timestamps: true });

// User Group
const mapLocation = {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  address1: String,
  address2: String,
  landmark: String,
  nameTage: String,
  createdAt: Date,
  updatedAt: Date
};
const mapLocationSchema = new Schema(mapLocation, { versionKey: false, timestamps: true });

// User Profile Pics
const userProfilePics = {
    _id: { type: objectId, auto: true },
    userId: { type: objectId, required: true },
    profilePics: String,
    createdAt: Date,
    updatedAt: Date
};
const userProfilePicsSchema = new Schema(userProfilePics, { versionKey: false, timestamps: true });


// User Notification
const usernotifications = {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  isPauseAll: { type: Boolean, default: 0 },
  isEmailNotification: { type: Boolean, default: 0 },
  isWhatsappNotification: { type: Boolean, default: 0 },
  eventsNearMe: { type: String, default: "all" },
  facilitiesNearMe:  {type: String, default: "all" },
  publicArtProducts:  {type: String, default: "all" },
  coursesNearMe:  {type: String, default: "all" },
  saleNearMe: { type: String, default: "all" },
  isRequestReceived: { type: Boolean, default: 0 },
  isRequestAccepted: { type: Boolean, default: 0 },
  isStudentOnly: { type: Boolean, default: 0 },
  createdAt: Date,
  updatedAt: Date
};
const userNotificationSchema = new Schema(usernotifications, { versionKey: false, timestamps: true });

// User Tags & Data Sharing
const usertagsdatasharings = {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  isReviewTags: { type: Boolean, default: 0 },
  isCollaborationRequest: { type: Boolean, default: 0 },
  createdAt: Date,
  updatedAt: Date
};
const userTagsDataSharingSchema = new Schema(usertagsdatasharings, { versionKey: false, timestamps: true });

// User Privacy
const userprivacies = {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  isPrivateAccount: { type: Boolean, default: 0 },
  SupporterOrSubscriber: { type: Boolean, default: 1 },
  isSupporter: { type: Boolean, default: 1 },
  isSubscriber: { type: Boolean, default: 1 },
  isVisibility: { type: Boolean, default: 1 },
  isBuyers: { type: Boolean, default: 0 },
  post: { type: String, default: "anyone" },
  artSocial: { type: String, default: "anyone" },
  journal: { type: String, default: "anyone" },
  canComment: { type: String, default: "anyone" },
  canTag: { type: String, default: "anyone" },
  canMention: { type: String, default: "anyone" },
  createdAt: Date,
  updatedAt: Date
};
const userPrivacySchema = new Schema(userprivacies, { versionKey: false, timestamps: true });

// User Blocked Accounts
const userBlockedAccounts = {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  blockId: { type: objectId, required: true },
  createdAt: Date,
  updatedAt: Date
};
const userBlockedAccountsSchema = new Schema(userBlockedAccounts, { versionKey: false, timestamps: true });

// User Languages
const userlanguages = {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  languageId: [{ type: objectId, required: true }],
  createdAt: Date,
  updatedAt: Date
};
const userLanguagesSchema = new Schema(userlanguages, { versionKey: false, timestamps: true });

// User Location
const userlocations = {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  isUsingApp: { type: Boolean, default: 1 },
  isAllowMap: { type: Boolean, default: 1 },
  createdAt: Date,
  updatedAt: Date
};
const userLocationSchema = new Schema(userlocations, { versionKey: false, timestamps: true });

// User History Logs
const userHistoryLogs = {
    _id: { type: objectId, auto: true },
    userId: { type: objectId, required: true },
    login: { type: String },
    ipAddress: { type: String },
    duration: { type: String },
    lastSeen: { type: String },
    status: { type: Boolean },
    loginTime: { type: String },
    loginOutTime: { type: String },
    createdAt: Date,
    updatedAt: Date
};
const userHistoryLogsSchema = new Schema(userHistoryLogs, { versionKey: false });

// User Education
const UserEducation = {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  school: { type: String },
  degree: { type: String },
  field: { type: String },
  startTime: { type: String },
  EndTime: { type: String },
  grade: { type: String },
  activities: { type: String },
  description: { type: String },
  createdAt: Date,
  updatedAt: Date
};
const UserEducationSchema = new Schema(UserEducation, { versionKey: false });

const UserWorkExperience = {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  role: { type: String },
  empType: { type: String },
  company: { type: String },
  location: { type: String },
  currentWork: { type: Boolean },
  startTime: { type: String },
  EndTime: { type: String },
  description: { type: String },
  createdAt: Date,
  updatedAt: Date
};
const UserWorkExperienceSchema = new Schema(UserWorkExperience, { versionKey: false });


const UserCertification = {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  field: { type: String },
  certificate: { type: String },
  name: { type: String },
  hostName: { type: String },
  projUrl: { type: String },
  startTime: { type: String },
  EndTime: { type: String },
  description: { type: String },
  createdAt: Date,
  updatedAt: Date
};
const UserCertificationSchema = new Schema(UserCertification, { versionKey: false });

const UserPatent = {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  title: { type: String },
  type: { type: String },
  applicationNumber: { type: String },
  inventor: { type: String },
  projUrl: { type: String },
  startTime: { type: String },
  EndTime: { type: String },
  description: { type: String },
  createdAt: Date,
  updatedAt: Date
};
const UserPatentSchema = new Schema(UserPatent, { versionKey: false });

const UserSkills = {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  skills: { type: String },
  endorsedBy: { type: [String] },
  endorsmentRequested: { type: [String] },
  createdAt: Date,
  updatedAt: Date
};
const UserSkillsSchema = new Schema(UserSkills, { versionKey: false });

const UserAwards = {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  title: { type: String },
  awardedBy: { type: String },
  announcementDate: { type: String },
  awardType: { type: String },
  createdAt: Date,
  updatedAt: Date
};
const UserAwardsSchema = new Schema(UserAwards, { versionKey: false });

const LinkedUsers = {
  _id: { type: objectId, auto: true },
  user: { type: objectId, required: true },
  linkWith: { type: objectId, required: true },
  createdAt: Date,
  updatedAt: Date
};
const LinkedUsersSchema = new Schema(LinkedUsers, { versionKey: false });

const  followersRequest= {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  senderId: { type: objectId, required: true },
  createdate: Date,
};
const followersRequestSchema = new Schema(followersRequest, { versionKey: false,timestamps: true  });

const  followers= {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  senderId: { type: objectId, required: true },
  createdate: Date,
};
const followersSchema = new Schema(followers, { versionKey: false,timestamps: true  });

const  following= {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  senderId: { type: objectId, required: true },
  createdate: Date,
};
const followingSchema = new Schema(following, { versionKey: false,timestamps: true  });

const  requestAccepted= {
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  senderId: { type: objectId, required: true },
  createdate: Date,
};
const requestAcceptedSchema = new Schema(requestAccepted, { versionKey: false,timestamps: true  });

const supporters ={
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  userSupporterId: { type: objectId, required: true },
  fname: String,
  lname: String,
  name: String,
  profile: String,
  createdate: Date,
};
const supporterSchema = new Schema(supporters, { versionKey: false,timestamps: true  });

const supporting={
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  userSupportingId: { type: objectId, required: true },
  fname: String,
  lname: String,
  name: String,
  createdate: Date,
};
const supportingSchema = new Schema(supporting, { versionKey: false,timestamps: true  });

 const communities ={
  _id: { type: objectId, auto: true },
  userId: { type: objectId, required: true },
  communityId: { type: objectId, required: true },
  fname: String,
  lname: String,
  name: String,
  createdate: Date,
};
const communitiesSchema = new Schema(communities, { versionKey: false,timestamps: true  });

const inviteusers={
  _id: { type: objectId, auto: true},
  userId:{ type: objectId , required:true},
  teammeber:[
    {email: String,
    phone:Number}
  ],
  status:{type:Boolean , default:1},
  createdAt:Date,
  updatedAt:Date
}
const inviteusersSchema=new Schema(inviteusers, {versionKey: false , timestamps: true});

const allnotifications={
  _id: { type: objectId, auto: true},
  userId:{ type: objectId , required:true},
  senderId:{ type: objectId , required:true},
  notificationType:String,
  isRequest: {type:Boolean,default:0,},
  status:{type:Boolean, default:1},
  createdAt:Date,
  updatedAt:Date
}
const allnotificationsSchema=new Schema(allnotifications, {versionKey:false, timestamps:true});

const teammembers={
  _id: { type: objectId, auto: true},
  userId:{ type: objectId , required:true},
  teamMemberId:{ type: objectId , required:true},
  status:{type:Boolean, default:1},
  createdAt:Date,
  updatedAt:Date
}
const teammembersSchema=new Schema(teammembers,{versionKey:false,timestamps:true});


module.exports = {
  Auth: mongoose.model("user", userSchema),
  Details: mongoose.model("userDetails", userDetailsSchema),
  Group: mongoose.model("userGroup", userGroupSchema),
  ProfilePics: mongoose.model("userProfilePics", userProfilePicsSchema),
  Register: mongoose.model("registraions", registrationsSchema),
  Notification: mongoose.model("usernotifications", userNotificationSchema),
  TagsDataSharing: mongoose.model("usertagsdatasharings", userTagsDataSharingSchema),
  Privacy: mongoose.model("userprivacies", userPrivacySchema),
  Block: mongoose.model("userBlockedAccount", userBlockedAccountsSchema),
  Language: mongoose.model("userlanguages", userLanguagesSchema),
  Location: mongoose.model("userlocations", userLocationSchema),
  HistoryLogs: mongoose.model("userHistoryLog", userHistoryLogsSchema),
  mapLoaction:mongoose.model("mapLocation",mapLocationSchema),
  UserEducation:mongoose.model("userEducation", UserEducationSchema),
  UserWorkExperience:mongoose.model("UserWorkExperience", UserWorkExperienceSchema),
  UserPatent:mongoose.model("UserPatent", UserPatentSchema),
  UserAwards:mongoose.model("UserAwards", UserAwardsSchema),
  UserCertification:mongoose.model("UserCertification", UserCertificationSchema),
  UserSkills:mongoose.model("UserSkills", UserSkillsSchema),
  LinkedUsers:mongoose.model("LinkedUsers", LinkedUsersSchema),
  followersRequest:mongoose.model("followersRequest", followersRequestSchema),
  followers:mongoose.model("followers", followersSchema),
  following:mongoose.model("following", followingSchema),
  requestAccepted:mongoose.model("requestAccepted",requestAcceptedSchema),
  supporters:mongoose.model("supporters",supporterSchema),
  supporting:mongoose.model("supporting",supportingSchema),
  communities:mongoose.model("communities",communitiesSchema),
  InviteUsers:mongoose.model("inviteusers",inviteusersSchema),
  AllNotifications:mongoose.model("allnotifications",allnotificationsSchema),
  TeamMember:mongoose.model("teammembers",teammembersSchema)
};
