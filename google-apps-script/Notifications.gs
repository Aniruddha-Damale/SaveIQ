/**
 * SaveIQ - Notification & Gmail Services (Notifications.gs)
 * 
 * Handles:
 * - Deadline Reminders
 * - Progress Warnings
 * - Goal Completion Celebrations
 * - Monthly Check-in Reminders
 * - Google Sheets Notifications persistence
 */

function createNotificationRecord(item) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('Notifications');
    if (!sheet) return;

    var notifId = 'notif_' + Utilities.getUuid().substring(0, 8);
    var now = new Date().toISOString();

    sheet.appendRow([
      notifId,
      item.userId || 'user_default',
      item.goalId || '',
      item.type,
      item.message,
      item.scheduledDate || now.split('T')[0],
      item.sentStatus || 'SENT',
      now
    ]);
  } catch (err) {
    Logger.log("Failed to create notification record: " + err.toString());
  }
}

/**
 * Sends a rich, responsive HTML email via GmailApp.
 */
function sendReminderEmail(type, goalId, recipientEmail) {
  var userEmail = recipientEmail;
  if (!userEmail) {
    try {
      userEmail = Session.getActiveUser().getEmail();
    } catch (e) {
      userEmail = '';
    }
  }

  // Fallback to property or default if active user is empty in Web App context
  if (!userEmail || userEmail === '') {
    var prop = PropertiesService.getScriptProperties();
    userEmail = prop.getProperty('USER_NOTIFICATION_EMAIL');
  }

  if (!userEmail) {
    Logger.log("No recipient email found to send notification.");
    return { success: false, message: "No email address found for notifications." };
  }

  var goalData = {};
  if (goalId) {
    var gRes = getGoal(goalId);
    if (gRes && gRes.success) {
      goalData = gRes.data;
    }
  }

  var prop = PropertiesService.getScriptProperties();
  var appUrl = prop.getProperty('APP_URL') || 'https://saveiq.app';
  var currency = prop.getProperty('USER_CURRENCY') || '₹';

  var subject = '';
  var bodyHtml = '';
  var goalName = goalData.goalName || 'Your Savings Goal';
  var target = Number(goalData.targetAmount) || 0;
  var saved = Number(goalData.currentSavings) || 0;
  var remaining = Math.max(0, target - saved);
  var progress = target > 0 ? Math.round((saved / target) * 100) : 0;
  var deadline = goalData.deadline || 'Upcoming';

  switch (type) {
    case 'DEADLINE_REMINDER':
      subject = '⏳ SaveIQ Alert: Deadline approaching for ' + goalName;
      bodyHtml = generateEmailTemplate({
        title: 'Deadline Approaching',
        headline: 'Your goal deadline is just around the corner.',
        goalName: goalName,
        progress: progress,
        saved: currency + saved.toLocaleString(),
        target: currency + target.toLocaleString(),
        remaining: currency + remaining.toLocaleString(),
        deadline: deadline,
        actionText: 'Review Goal in SaveIQ',
        actionUrl: appUrl,
        bannerColor: '#059669',
        badgeText: 'Deadline Warning'
      });
      break;

    case 'PROGRESS_WARNING':
      subject = '⚠️ SaveIQ Alert: Progress check for ' + goalName;
      bodyHtml = generateEmailTemplate({
        title: 'Savings Progress Warning',
        headline: 'Your current pace is below your planned monthly target.',
        goalName: goalName,
        progress: progress,
        saved: currency + saved.toLocaleString(),
        target: currency + target.toLocaleString(),
        remaining: currency + remaining.toLocaleString(),
        deadline: deadline,
        actionText: 'Add Savings to Catch Up',
        actionUrl: appUrl,
        bannerColor: '#d97706',
        badgeText: 'Pace Warning'
      });
      break;

    case 'GOAL_COMPLETED':
      subject = '🎉 SaveIQ Milestone: You completed ' + goalName + '!';
      bodyHtml = generateEmailTemplate({
        title: 'Goal Achieved!',
        headline: 'Congratulations! You reached 100% of your target.',
        goalName: goalName,
        progress: 100,
        saved: currency + saved.toLocaleString(),
        target: currency + target.toLocaleString(),
        remaining: currency + '0',
        deadline: 'Achieved!',
        actionText: 'Celebrate & Plan Next Goal',
        actionUrl: appUrl,
        bannerColor: '#10b981',
        badgeText: 'Milestone Completed'
      });
      break;

    case 'MONTHLY_CHECKIN':
    default:
      subject = '📅 SaveIQ: Time for your monthly savings check-in';
      bodyHtml = generateEmailTemplate({
        title: 'Monthly Savings Audit',
        headline: 'Here is your monthly progress summary.',
        goalName: goalName,
        progress: progress,
        saved: currency + saved.toLocaleString(),
        target: currency + target.toLocaleString(),
        remaining: currency + remaining.toLocaleString(),
        deadline: deadline,
        actionText: 'Open SaveIQ Dashboard',
        actionUrl: appUrl,
        bannerColor: '#0f766e',
        badgeText: 'Monthly Check-in'
      });
      break;
  }

  try {
    GmailApp.sendEmail(userEmail, subject, 'Please view this email with HTML enabled.', {
      htmlBody: bodyHtml,
      name: 'SaveIQ Notifications'
    });

    createNotificationRecord({
      userId: 'user_default',
      goalId: goalId,
      type: type,
      message: subject,
      sentStatus: 'SENT'
    });

    return {
      success: true,
      message: 'Notification email successfully sent to ' + userEmail
    };
  } catch (err) {
    Logger.log("Gmail send error: " + err.toString());
    return {
      success: false,
      message: 'Error sending email: ' + err.toString()
    };
  }
}

/**
 * Builds responsive FinTech styled HTML email.
 */
function generateEmailTemplate(data) {
  return '<!DOCTYPE html>' +
    '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<style>' +
    'body { margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color:#0f172a; }' +
    '.wrapper { max-width:580px; margin:24px auto; background:#ffffff; border-radius:12px; border:1px solid #e2e8f0; overflow:hidden; }' +
    '.header { background:' + data.bannerColor + '; padding:28px 24px; color:#ffffff; }' +
    '.brand { font-size:22px; font-weight:800; letter-spacing:-0.5px; }' +
    '.badge { display:inline-block; margin-top:8px; padding:3px 10px; background:rgba(255,255,255,0.2); font-size:11px; font-weight:600; text-transform:uppercase; border-radius:20px; }' +
    '.content { padding:28px 24px; }' +
    '.metric-box { background:#f1f5f9; border-radius:8px; padding:16px; margin:20px 0; }' +
    '.metric-row { display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px; }' +
    '.progress-bar-bg { background:#e2e8f0; border-radius:6px; height:8px; width:100%; margin-top:8px; overflow:hidden; }' +
    '.progress-bar-fill { background:' + data.bannerColor + '; height:8px; width:' + data.progress + '%; }' +
    '.btn { display:inline-block; padding:12px 24px; background:' + data.bannerColor + '; color:#ffffff !important; text-decoration:none; font-weight:600; font-size:14px; border-radius:6px; margin-top:16px; text-align:center; }' +
    '.footer { padding:20px 24px; background:#f8fafc; border-top:1px solid #e2e8f0; font-size:12px; color:#64748b; text-align:center; }' +
    '</style></head>' +
    '<body>' +
    '<div class="wrapper">' +
    '  <div class="header">' +
    '    <div class="brand">SaveIQ</div>' +
    '    <div class="badge">' + data.badgeText + '</div>' +
    '    <h1 style="margin:12px 0 0; font-size:20px; font-weight:700;">' + data.title + '</h1>' +
    '  </div>' +
    '  <div class="content">' +
    '    <p style="font-size:15px; line-height:1.6; margin-top:0;">' + data.headline + '</p>' +
    '    <h3 style="margin:20px 0 8px; font-size:17px; color:#0f172a;">' + data.goalName + '</h3>' +
    '    <div class="metric-box">' +
    '      <div class="metric-row"><span>Saved</span><strong style="font-family:monospace;">' + data.saved + ' / ' + data.target + '</strong></div>' +
    '      <div class="metric-row"><span>Remaining</span><strong style="font-family:monospace;">' + data.remaining + '</strong></div>' +
    '      <div class="metric-row"><span>Deadline</span><strong>' + data.deadline + '</strong></div>' +
    '      <div class="progress-bar-bg"><div class="progress-bar-fill"></div></div>' +
    '      <div style="text-align:right; font-size:12px; color:#64748b; margin-top:4px;">' + data.progress + '% completed</div>' +
    '    </div>' +
    '    <a href="' + data.actionUrl + '" class="btn">' + data.actionText + '</a>' +
    '  </div>' +
    '  <div class="footer">' +
    '    <p style="margin:0;">SaveIQ — Smart Savings. Better Goals. Stronger Future.</p>' +
    '    <p style="margin:4px 0 0;">Automated notification via Google Apps Script and Gmail Services.</p>' +
    '  </div>' +
    '</div></body></html>';
}
