/**
 * SaveIQ - Utilities & Analytics Helper (Utils.gs)
 */

function getAnalyticsData(userId) {
  var ss = getSpreadsheet();
  var goalsRes = getGoals(userId);
  var goals = goalsRes.data || [];

  var txSheet = ss.getSheetByName('SavingsTransactions');
  var transactions = [];
  if (txSheet) {
    var rawTx = txSheet.getDataRange().getValues();
    var txHeaders = rawTx[0];
    for (var i = 1; i < rawTx.length; i++) {
      var tx = {};
      for (var j = 0; j < txHeaders.length; j++) {
        tx[txHeaders[j]] = rawTx[i][j];
      }
      transactions.push(tx);
    }
  }

  // Aggregate Category Distribution
  var categories = {};
  goals.forEach(function(g) {
    var cat = g.category || 'Other';
    categories[cat] = (categories[cat] || 0) + (Number(g.currentSavings) || 0);
  });

  // Aggregate Status Breakdown
  var statusCounts = { Active: 0, Completed: 0, Overdue: 0 };
  var today = new Date();
  goals.forEach(function(g) {
    var target = Number(g.targetAmount) || 0;
    var saved = Number(g.currentSavings) || 0;
    var deadline = g.deadline ? new Date(g.deadline) : null;
    if (g.status === 'Completed' || saved >= target) {
      statusCounts.Completed++;
    } else if (deadline && deadline < today) {
      statusCounts.Overdue++;
    } else {
      statusCounts.Active++;
    }
  });

  return {
    success: true,
    data: {
      categoryDistribution: categories,
      statusCounts: statusCounts,
      transactions: transactions,
      goalsSummary: goals.map(function(g) {
        return {
          id: g.goalId,
          name: g.goalName,
          target: Number(g.targetAmount) || 0,
          saved: Number(g.currentSavings) || 0,
          category: g.category,
          progress: Number(g.targetAmount) > 0 ? Math.round(((Number(g.currentSavings) || 0) / Number(g.targetAmount)) * 100) : 0
        };
      })
    }
  };
}

function updateUserProfile(profileData) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return { success: false, message: 'Users sheet not found.' };

  var data = sheet.getDataRange().getValues();
  var foundRow = -1;
  var userId = profileData.userId || 'user_default';

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      foundRow = i + 1;
      break;
    }
  }

  var now = new Date().toISOString();
  if (foundRow > -1) {
    sheet.getRange(foundRow, 2).setValue(profileData.name || 'User');
    sheet.getRange(foundRow, 3).setValue(profileData.email || '');
    sheet.getRange(foundRow, 4).setValue(profileData.currency || '₹');
    sheet.getRange(foundRow, 6).setValue(now);
  } else {
    sheet.appendRow([userId, profileData.name || 'User', profileData.email || '', profileData.currency || '₹', now, now]);
  }

  // Also store in ScriptProperties for background triggers to reference
  var prop = PropertiesService.getScriptProperties();
  if (profileData.email) prop.setProperty('USER_NOTIFICATION_EMAIL', profileData.email);
  if (profileData.currency) prop.setProperty('USER_CURRENCY', profileData.currency);

  return { success: true, message: 'Profile updated in Google Sheets database.' };
}
