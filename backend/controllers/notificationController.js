import notificationModel from '../models/notification.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel
      .find({ user: req.session.userId })
      .sort({ createdAt: -1 });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await notificationModel.findByIdAndUpdate(
      req.params.id,
      { $set: { isRead: true } },
      { returnDocument: 'after' }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};