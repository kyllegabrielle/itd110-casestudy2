const { session } = require('../config/db');

// @desc    Get user notifications
// @route   GET /api/v1/notifications
exports.getNotifications = async (req, res) => {
  const s = session();
  try {
    const result = await s.run(`
      MATCH (u:User {id: $id})-[r:HAS_NOTIFICATION]->(n:Notification)
      RETURN n, r.read as read
      ORDER BY n.createdAt DESC
      LIMIT 20
    `, { id: req.user.id });

    const notifications = result.records.map(record => ({
      ...record.get('n').properties,
      read: record.get('read')
    }));
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await s.close();
  }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
exports.markAsRead = async (req, res) => {
  const s = session();
  try {
    await s.run(`
      MATCH (u:User {id: $id})-[r:HAS_NOTIFICATION]->(n:Notification {notificationId: $notificationId})
      SET r.read = true
    `, { 
      id: req.user.id,
      notificationId: req.params.id 
    });
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await s.close();
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  const s = session();
  try {
    await s.run(`
      MATCH (u:User {id: $id})-[r:HAS_NOTIFICATION]->(n:Notification)
      SET r.read = true
    `, { id: req.user.id });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await s.close();
  }
};
