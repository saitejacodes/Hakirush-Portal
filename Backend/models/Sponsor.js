import mongoose from "mongoose";

const sponsorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    collaboration: {
      type: String,
      enum: ["Title Sponsor", "Associate Sponsor", "Event Sponsor", "Media Partner"],
      required: true
    },

    eventsSponsored: { type: Number, default: 0 },

    reach: { type: String, required: true },

    upcomingEvents: { type: String },

    logo: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Sponsor", sponsorSchema);