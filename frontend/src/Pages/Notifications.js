// src/Pages/Notifications.js
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import "./Notifications.css";

const Notifications = ({ role, getToken, BASE_URL, onNotificationClick }) => {
  const [notificationList, setNotificationList] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  
  // Store previous data to detect NEW items
  const previousDataRef = useRef({
    staffIds: [],
    appIds: [],
    companyIds: [],
    exceptionIds: [],
    logIds: [],
    reviewIds: [],
    placementIds: []
  });

  // Get seen notifications from localStorage for this role
  const getSeenNotifications = () => {
    const seen = localStorage.getItem(`seen_notifications_${role}`);
    return seen ? JSON.parse(seen) : [];
  };

  // Save seen notification ID
  const markAsSeen = useCallback((notificationId) => {
    const seen = getSeenNotifications();
    if (!seen.includes(notificationId)) {
      seen.push(notificationId);
      localStorage.setItem(`seen_notifications_${role}`, JSON.stringify(seen));
    }
    setNotificationList(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [role]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    const seen = getSeenNotifications();
    notificationList.forEach(notification => {
      if (!seen.includes(notification.id)) {
        seen.push(notification.id);
      }
    });
    localStorage.setItem(`seen_notifications_${role}`, JSON.stringify(seen));
    setNotificationList([]);
    setUnreadCount(0);
    setShowNotifications(false);
  }, [notificationList, role]);

  // Detect NEW items
  const detectNewItems = (currentItems, previousIds) => {
    return currentItems.filter(item => !previousIds.includes(item.id));
  };

  // Fetch notifications once
  const fetchNotifications = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    
    try {
      const token = getToken();
      if (!token) {
        setIsFetching(false);
        return;
      }

      let newNotifications = [];
      const seenIds = getSeenNotifications();

      if (role === 'admin') {
        const [staffRes, appsRes, companiesRes, exceptionsRes] = await Promise.all([
          axios.get(`${BASE_URL}/users/pending_staff/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/placements/pending/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/admin/pending-companies/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/admin/pending-exceptions/`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const currentStaff = staffRes.data;
        const currentApps = appsRes.data;
        const currentCompanies = companiesRes.data;
        const currentExceptions = exceptionsRes.data;

        // New Staff
        const newStaff = detectNewItems(currentStaff, previousDataRef.current.staffIds);
        newStaff.forEach(staff => {
          newNotifications.push({
            id: `staff_${staff.id}`,
            title: '👥 New Staff Registration',
            message: `${staff.first_name || ''} ${staff.last_name || ''} registered as ${staff.role}`,
            icon: '👥',
            timestamp: Date.now(),
            type: 'staff',
            action: 'Approve Staff'
          });
        });

        // New Applications
        const newApps = detectNewItems(currentApps, previousDataRef.current.appIds);
        newApps.forEach(app => {
          newNotifications.push({
            id: `app_${app.id}`,
            title: '📝 New Placement Application',
            message: `${app.student_name || 'Student'} applied at ${app.company_name}`,
            icon: '📝',
            timestamp: Date.now(),
            type: 'application',
            action: 'Assign Supervisor'
          });
        });

        // New Companies
        const newCompanies = detectNewItems(currentCompanies, previousDataRef.current.companyIds);
        newCompanies.forEach(company => {
          newNotifications.push({
            id: `company_${company.id}`,
            title: '🏢 New Company Registration',
            message: `${company.name} pending approval`,
            icon: '🏢',
            timestamp: Date.now(),
            type: 'company',
            action: 'Approve Company'
          });
        });

        // New Exceptions
        const newExceptions = detectNewItems(currentExceptions, previousDataRef.current.exceptionIds);
        newExceptions.forEach(exception => {
          newNotifications.push({
            id: `exception_${exception.id}`,
            title: '⚠️ Log Exception Request',
            message: `${exception.student_name || 'Student'} requested a log exception`,
            icon: '⚠️',
            timestamp: Date.now(),
            type: 'exception',
            action: 'Review Exception'
          });
        });

        // Update stored data
        previousDataRef.current = {
          staffIds: currentStaff.map(s => s.id),
          appIds: currentApps.map(a => a.id),
          companyIds: currentCompanies.map(c => c.id),
          exceptionIds: currentExceptions.map(e => e.id),
          logIds: previousDataRef.current.logIds,
          reviewIds: previousDataRef.current.reviewIds,
          placementIds: previousDataRef.current.placementIds
        };
      }
      else if (role === 'academic' || role === 'workplace') {
        const [pendingLogsRes] = await Promise.all([
          axios.get(`${BASE_URL}/logs/pending/`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const currentPendingLogs = pendingLogsRes.data;
        const newLogs = detectNewItems(currentPendingLogs, previousDataRef.current.logIds);
        
        newLogs.forEach(log => {
          newNotifications.push({
            id: `log_${log.id}`,
            title: '📋 New Log to Review',
            message: `${log.student_name} submitted Week ${log.week_number} log`,
            icon: '📋',
            timestamp: Date.now(),
            type: 'log',
            action: 'Review Log'
          });
        });

        previousDataRef.current.logIds = currentPendingLogs.map(l => l.id);
      }
      else if (role === 'student') {
        try {
          const [placementRes, logReviewsRes] = await Promise.all([
            axios.get(`${BASE_URL}/placements/my-placement/`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${BASE_URL}/logs/my-reviews/`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
          ]);

          const placement = placementRes.data;
          if (placement && placement.status === 'approved') {
            const notifId = `placement_${placement.id}`;
            if (!seenIds.includes(notifId)) {
              newNotifications.push({
                id: notifId,
                title: '✅ Placement Approved',
                message: `Your internship at ${placement.company_name} has been approved!`,
                icon: '✅',
                timestamp: Date.now(),
                type: 'placement',
                action: 'Submit Log'
              });
            }
          }

          const reviews = logReviewsRes.data;
          const newReviews = detectNewItems(reviews, previousDataRef.current.reviewIds);
          newReviews.forEach(review => {
            newNotifications.push({
              id: `review_${review.id}`,
              title: review.status === 'approved' ? '✅ Log Approved' : '❌ Log Rejected',
              message: `Week ${review.week_number} log: ${review.status}. Score: ${review.score || 'N/A'}`,
              icon: review.status === 'approved' ? '✅' : '❌',
              timestamp: Date.now(),
              type: 'review',
              action: 'View Details'
            });
          });

          previousDataRef.current.reviewIds = reviews.map(r => r.id);
          previousDataRef.current.placementIds = placement ? [placement.id] : [];
        } catch (err) {
          console.error("Student notification error:", err);
        }
      }

      // Filter out already seen notifications
      const unseenNotifications = newNotifications.filter(n => !seenIds.includes(n.id));

      if (unseenNotifications.length > 0) {
        setNotificationList(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const uniqueNew = unseenNotifications.filter(n => !existingIds.has(n.id));
          const updated = [...uniqueNew, ...prev];
          updated.sort((a, b) => b.timestamp - a.timestamp);
          return updated;
        });
        setUnreadCount(prev => prev + unseenNotifications.length);
      }

    } catch (error) {
      console.error(`Error fetching ${role} notifications:`, error);
    } finally {
      setIsFetching(false);
    }
  }, [role, getToken, BASE_URL]);

  // Fetch on mount and every 30 seconds (NOT every millisecond!)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <div className="notifications-wrapper">
      <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </div>

      {showNotifications && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notificationList.length > 0 && (
              <button onClick={clearAllNotifications} className="clear-btn">
                Clear all
              </button>
            )}
          </div>
          <div className="notification-list">
            {notificationList.length === 0 ? (
              <div className="no-notifications">No new notifications</div>
            ) : (
              notificationList.map(notif => (
                <div
                  key={notif.id}
                  className="notification-item"
                  onClick={() => {
                    markAsSeen(notif.id);
                    setShowNotifications(false);
                    if (onNotificationClick) {
                      onNotificationClick(notif);
                    }
                  }}
                >
                  <div className="notif-icon">{notif.icon}</div>
                  <div className="notif-content">
                    <div className="notif-title">{notif.title}</div>
                    <div className="notif-message">{notif.message}</div>
                    <div className="notif-action">{notif.action}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;