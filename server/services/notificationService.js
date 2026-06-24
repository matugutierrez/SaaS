const Notification = require('../models/Notification');

async function createNotification({ user, organization, type, message, link }) {
  try {
    const notif = await Notification.create({ user, organization, type, message, link });
    const populated = await Notification.findById(notif._id).populate('user', 'name email');
    return populated;
  } catch (err) {
    console.error('Notification service error:', err.message);
    return null;
  }
}

module.exports = { createNotification };
