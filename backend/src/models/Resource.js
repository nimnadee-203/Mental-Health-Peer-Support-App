const mongoose = require('mongoose');

const resourceSectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
    },
    paragraphs: {
      type: [String],
      required: true,
    },
  },
  { _id: false },
);

const resourceSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      default: 'Explore Resources',
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    icon: {
      type: String,
      default: '📄',
      trim: true,
    },
    accent: {
      type: String,
      default: '#D8E6FC',
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    readTime: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    content: {
      type: [resourceSectionSchema],
      required: true,
    },
  },
  { timestamps: true },
);

resourceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Resource', resourceSchema);
