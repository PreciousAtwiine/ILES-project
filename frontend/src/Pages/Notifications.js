// src/Pages/Notifications.js
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import "./Notifications.css";
import API_URL from '../utils/api';
import { 
  LuBell, 
  LuUsers, 
  LuFileText, 
  LuBuilding2, 
  LuCircleAlert,
  LuClipboardList, 
  LuCheck, 
  LuGraduationCap,
  LuEye,
  LuTrash2
} from 'react-icons/lu';

const Notifications = ({ role, getToken, onNotificationClick }) => {
  const [notificationList, setNotificationList] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  
  const previousDataRef = useRef({
    staffIds: [], appIds: [], companyIds: [], exceptionIds: [],
    logIds: [], reviewIds: [], placementIds: []
  });

  const getSeenNotifications = () => {
    const seen = localStorage.getItem(`seen_notifications_${role}`);
    return seen ? JSON.parse(seen) : [];
  };

  const markAsSeen = useCallback((notificationId) => {
    const seen = getSeenNotifications();
    if (!seen.includes(notificationId)) {
      seen.push(notificationId);
      localStorage.setItem(`seen_notifications_${role}`, JSON.stringify(seen));
    }
    setNotificationList(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [role]);

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

  const detectNewItems = (currentItems, previousIds) => {
    return currentItems.filter(item => !previousIds.includes(item.id));
  };

  const getIconComponent = (iconType, size = 20) => {
    const iconProps = { size, className: "notif-icon-svg" };
    
    switch(iconType) {
      case 'staff':
        return <LuUsers {...iconProps} />;
      case 'application':
        return <LuFileText {...iconProps} />;
      case 'company':
        return <LuBuilding2 {...iconProps} />;
      case 'exception':
        return <LuCircleAlert {...iconProps} />;
      case 'log':
        return <LuClipboardList {...iconProps} />;
      case 'placement':
        return <LuCheck {...iconProps} />;
      case 'review':
        return <LuEye {...iconProps} />;
      case 'evaluation':
        return <LuGraduationCap {...iconProps} />;
      default:
        return <LuBell {...iconProps} />;
    }
  };

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
          axios.get(`${API_URL}/users/pending_staff/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/placements/pending/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/admin/pending-companies/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/admin/pending-exceptions/`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const currentStaff = staffRes.data;
        const currentApps = appsRes.data;
        const currentCompanies = companiesRes.data;
        const currentExceptions = exceptionsRes.data;

        const newStaff = detectNewItems(currentStaff, previousDataRef.current.staffIds);
        newStaff.forEach(staff => {
          newNotifications.push({
            id: `staff_${staff.id}`,
            title: 'New Staff Registration',
            message: `${staff.first_name || ''} ${staff.last_name || ''} registered as ${staff.role}`,
            iconType: 'staff',
            timestamp: Date.now(),
            type: 'staff',
            action: 'Approve Staff'
          });
        });

        const newApps = detectNewItems(currentApps, previousDataRef.current.appIds);
        newApps.forEach(app => {
          newNotifications.push({
            id: `app_${app.id}`,
            title: 'New Placement Application',
            message: `${app.student_name || 'Student'} applied at ${app.company_name}`,
            iconType: 'application',
            timestamp: Date.now(),
            type: 'application',
            action: 'Assign Supervisor'
          });
        });

        const newCompanies = detectNewItems(currentCompanies, previousDataRef.current.companyIds);
        newCompanies.forEach(company => {
          newNotifications.push({
            id: `company_${company.id}`,
            title: 'New Company Registration',
            message: `${company.name} pending approval`,
            iconType: 'company',
            timestamp: Date.now(),
            type: 'company',
            action: 'Approve Company'
          });
        });

        const newExceptions = detectNewItems(currentExceptions, previousDataRef.current.exceptionIds);
        newExceptions.forEach(exception => {
          newNotifications.push({
            id: `exception_${exception.id}`,
            title: 'Log Exception Request',
            message: `${exception.student_name || 'Student'} requested a log exception`,
            iconType: 'exception',
            timestamp: Date.now(),
            type: 'exception',
            action: 'Review Exception'
          });
        });

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
          axios.get(`${API_URL}/logs/pending/`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const currentPendingLogs = pendingLogsRes.data;
        const newLogs = detectNewItems(currentPendingLogs, previousDataRef.current.logIds);
        
        newLogs.forEach(log => {
          newNotifications.push({
            id: `log_${log.id}`,
            title: 'New Log to Review',
            message: `${log.student_name} submitted Week ${log.week_number} log`,
            iconType: 'log',
            timestamp: Date.now(),
            type: 'log',
            action: 'Review Log'
          });
        });

        previousDataRef.current.logIds = currentPendingLogs.map(l => l.id);
      }
      else if (role === 'student') {
        try {
          const dashboardRes = await axios.get(`${API_URL}/api/student/dashboard/`, { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          
          const dashboardData = dashboardRes.data;
          const placement = dashboardData.placement;
          
          if (placement && placement.status === 'approved') {
            const notifId = `placement_${placement.id}`;
            if (!seenIds.includes(notifId) && !previousDataRef.current.placementIds.includes(placement.id)) {
              newNotifications.push({
                id: notifId,
                title: 'Placement Approved',
                message: `Your internship at ${placement.company_name} has been approved!`,
                iconType: 'placement',
                timestamp: Date.now(),
                type: 'placement',
                action: 'Go to Placement'
              });
              previousDataRef.current.placementIds.push(placement.id);
            }
          }
          
          const recentLogs = dashboardData.recent_logs || [];
          const newReviews = recentLogs.filter(log => 
            log.feedback && !previousDataRef.current.reviewIds.includes(`review_${log.id}`)
          );
          
          newReviews.forEach(log => {
            newNotifications.push({
              id: `review_${log.id}`,
              title: log.status === 'approved' ? 'Log Approved' : 'Log Rejected',
              message: `Week ${log.week_number}: ${log.status}. Score: ${log.score || 'N/A'}`,
              iconType: 'review',
              timestamp: Date.now(),
              type: 'review',
              action: 'View Logs'
            });
            previousDataRef.current.reviewIds.push(`review_${log.id}`);
          });
          
          if (dashboardData.evaluation?.final_score) {
            const notifId = `evaluation_${placement?.id || 'final'}`;
            if (!seenIds.includes(notifId)) {
              newNotifications.push({
                id: notifId,
                title: 'Evaluation Complete',
                message: `Final score: ${dashboardData.evaluation.final_score} (Grade: ${dashboardData.evaluation.grade})`,
                iconType: 'evaluation',
                timestamp: Date.now(),
                type: 'evaluation',
                action: 'View Results'
              });
            }
          }
          
          previousDataRef.current.reviewIds = [...new Set(previousDataRef.current.reviewIds)];
          previousDataRef.current.placementIds = [...new Set(previousDataRef.current.placementIds)];
          
        } catch (err) {
          console.error("Student notification error:", err);
        }
      }

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
  }, [role, getToken]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <div className="notifications-wrapper">
      <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
        <LuBell size={22} className="bell-icon" />
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </div>

      {showNotifications && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notificationList.length > 0 && (
              <button onClick={clearAllNotifications} className="clear-btn">
                <LuTrash2 size={14} />
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
                  <div className="notif-icon">
                    {getIconComponent(notif.iconType)}
                  </div>
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