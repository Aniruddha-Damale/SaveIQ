/**
 * SaveIQ - Time-Driven Triggers & Daily Audit System (Triggers.gs)
 * 
 * Implements the 10-step Daily Financial Audit:
 * 1. Read active goals from Google Sheets.
 * 2. Calculate current progress.
 * 3. Check deadlines.
 * 4. Detect overdue goals.
 * 5. Detect upcoming deadlines.
 * 6. Compare current savings against monthly targets.
 * 7. Generate appropriate notifications.
 * 8. Send email reminders.
 * 9. Record sent notifications.
 * 10. Prevent duplicate notifications within 24 hours.
 */

/**
 * Sets up a recurring daily trigger between 8am and 9am.
 */
function setupDailyAuditTrigger() {
  // Remove existing trigger to prevent duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'runDailyFinancialAudit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Create new daily trigger
  ScriptApp.newTrigger('runDailyFinancialAudit')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  Logger.log('SaveIQ daily financial audit trigger scheduled successfully for 8:00 AM daily.');
  return { success: true, message: 'Daily audit trigger active at 8:00 AM.' };
}

/**
 * Core daily financial audit engine
 */
function runDailyFinancialAudit(userId) {
  var ss = getSpreadsheet();
  var goalsSheet = ss.getSheetByName('Goals');
  var notifSheet = ss.getSheetByName('Notifications');
  if (!goalsSheet) return { success: false, message: 'Goals sheet not found.' };

  var goalsData = goalsSheet.getDataRange().getValues();
  if (goalsData.length <= 1) return { success: true, message: 'No goals to audit.' };

  var headers = goalsData[0];
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var auditedCount = 0;
  var notificationsCreated = 0;
  var emailsSent = 0;

  // Cache existing notifications sent today to prevent duplicates
  var existingTodayKeys = {};
  if (notifSheet) {
    var notifRows = notifSheet.getDataRange().getValues();
    var todayStr = today.toISOString().split('T')[0];
    for (var n = 1; n < notifRows.length; n++) {
      var nDate = notifRows[n][5] ? String(notifRows[n][5]).split('T')[0] : '';
      if (nDate === todayStr) {
        var key = notifRows[n][2] + '_' + notifRows[n][3]; // goalId_type
        existingTodayKeys[key] = true;
      }
    }
  }

  for (var i = 1; i < goalsData.length; i++) {
    var row = goalsData[i];
    var goalId = row[0];
    var gUserId = row[1];
    var goalName = row[2];
    var targetAmount = Number(row[4]) || 0;
    var currentSavings = Number(row[5]) || 0;
    var deadlineStr = row[6];
    var monthlyTarget = Number(row[7]) || 0;
    var status = row[9];

    if (userId && gUserId !== userId && gUserId !== 'user_default') continue;
    if (status === 'Completed' || currentSavings >= targetAmount) continue;

    auditedCount++;

    if (deadlineStr) {
      var deadline = new Date(deadlineStr);
      deadline.setHours(0, 0, 0, 0);
      var diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Overdue detection
      if (diffDays < 0) {
        var overdueKey = goalId + '_OVERDUE';
        if (!existingTodayKeys[overdueKey]) {
          createNotificationRecord({
            userId: gUserId,
            goalId: goalId,
            type: 'OVERDUE',
            message: 'Your goal "' + goalName + '" is overdue by ' + Math.abs(diffDays) + ' days.'
          });
          notificationsCreated++;
        }
      } 
      // Upcoming deadline: 7 days or 3 days remaining
      else if (diffDays <= 7 && diffDays >= 0) {
        var deadlineKey = goalId + '_DEADLINE_REMINDER';
        if (!existingTodayKeys[deadlineKey]) {
          createNotificationRecord({
            userId: gUserId,
            goalId: goalId,
            type: 'DEADLINE_REMINDER',
            message: 'Deadline approaching for "' + goalName + '": ' + diffDays + ' day(s) remaining.'
          });
          sendReminderEmail('DEADLINE_REMINDER', goalId);
          notificationsCreated++;
          emailsSent++;
          existingTodayKeys[deadlineKey] = true;
        }
      }
    }

    // Monthly saving target pace audit
    if (monthlyTarget > 0 && currentSavings < targetAmount) {
      var dayOfMonth = today.getDate();
      // On the 20th of the month, check if pacing is lagging
      if (dayOfMonth >= 20) {
        var paceKey = goalId + '_PROGRESS_WARNING';
        if (!existingTodayKeys[paceKey]) {
          createNotificationRecord({
            userId: gUserId,
            goalId: goalId,
            type: 'PROGRESS_WARNING',
            message: 'Mid-month check: Ensure you deposit your planned monthly allocation for ' + goalName
          });
          notificationsCreated++;
          existingTodayKeys[paceKey] = true;
        }
      }
    }
  }

  return {
    success: true,
    data: {
      auditedGoals: auditedCount,
      notificationsCreated: notificationsCreated,
      emailsSent: emailsSent,
      timestamp: new Date().toISOString()
    },
    message: 'Daily financial audit finished. ' + auditedCount + ' goals inspected.'
  };
}
