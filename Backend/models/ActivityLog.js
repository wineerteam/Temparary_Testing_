import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  activityType: {
    type: String,
    enum: ["login", "search"],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  isp: {
    type: String,
    default: ""
  },
  userAgent: {
    type: String,
    default: ""
  },
  deviceId: {
    type: String,
    default: ""
  },
  isProxyOrVpn: {
    type: Boolean,
    default: false
  },
  details: {
    type: String,
    default: ""
  }
});

export default mongoose.model("ActivityLog", ActivityLogSchema);
