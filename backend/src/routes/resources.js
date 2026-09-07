const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

const serializeResource = resource => {
  const item = resource.toObject ? resource.toObject() : resource;

  return {
    id: String(item._id),
    category: item.category,
    section: item.section,
    title: item.title,
    description: item.description,
    icon: item.icon,
    accent: item.accent,
    image: item.image,
    readTime: item.readTime,
    content: item.content,
  };
};

/** GET /api/resources - List community resources. */
router.get('/', async (_req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources.map(serializeResource));
  } catch (err) {
    console.error('GET /api/resources error:', err.message);
    res.status(500).json({ error: 'Failed to fetch resources.' });
  }
});

/** POST /api/resources - Create a community resource. */
router.post('/', async (req, res) => {
  try {
    const {
      category,
      section,
      title,
      description,
      icon,
      accent,
      image,
      readTime,
      content,
    } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Category is required.' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required.' });
    }
    if (!readTime || !readTime.trim()) {
      return res.status(400).json({ error: 'Read time is required.' });
    }
    if (!Array.isArray(content) || content.length === 0) {
      return res.status(400).json({ error: 'Resource content is required.' });
    }

    const normalizedContent = content.map(item => ({
      heading: typeof item.heading === 'string' ? item.heading.trim() : '',
      paragraphs: Array.isArray(item.paragraphs)
        ? item.paragraphs
            .filter(paragraph => typeof paragraph === 'string')
            .map(paragraph => paragraph.trim())
            .filter(Boolean)
        : [],
    }));

    if (
      normalizedContent.some(
        item => !item.heading || item.paragraphs.length === 0,
      )
    ) {
      return res.status(400).json({
        error: 'Each content section needs a heading and paragraph.',
      });
    }

    const resource = await Resource.create({
      category: category.trim(),
      section: section?.trim() || 'Explore Resources',
      title: title.trim(),
      description: description.trim(),
      icon: icon?.trim() || '📄',
      accent: accent?.trim() || '#D8E6FC',
      image: image?.trim() || '',
      readTime: readTime.trim(),
      content: normalizedContent,
    });

    res.status(201).json({
      success: true,
      resource: serializeResource(resource),
    });
} catch (err) {
  console.error('POST /api/resources error:', err);
  res.status(500).json({
    error: err.message,
  });
}
});

module.exports = router;
