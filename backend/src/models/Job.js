const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  customerId: {
    type: String,
    required: true,
  },
  workerId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "assigned",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Job", jobSchema);