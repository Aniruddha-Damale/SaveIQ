/**
 * SaveIQ - Google Sheets Database Engine (Database.gs)
 * 
 * Manages 5 core sheets:
 * 1. Users (userId, name, email, currency, createdAt, updatedAt)
 * 2. Goals (goalId, userId, goalName, category, targetAmount, currentSavings, deadline, monthlyTarget, description, status, createdAt, updatedAt)
 * 3. SavingsTransactions (transactionId, goalId, amount, date, note, createdAt)
 * 4. Notifications (notificationId, userId, goalId, type, message, scheduledDate, sentStatus, createdAt)
 * 5. AIInsights (insightId, userId, goalId, insight, createdAt)
 */

// Helper to retrieve the active or specified spreadsheet
function getSpreadsheet() {
  var prop = PropertiesService.getScriptProperties();
  var sheetId = prop.getProperty('GOOGLE_SHEET_ID');
  if (sheetId && sheetId.trim() !== '') {
    return SpreadsheetApp.openById(sheetId);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Initializes the required sheets and headers if they do not exist.
 */
function initializeSheetsDatabase() {
  var ss = getSpreadsheet();
  if (!ss) {
    return { success: false, message: 'No Google Spreadsheet found or configured.' };
  }

  var schemas = {
    'Users': ['userId', 'name', 'email', 'currency', 'createdAt', 'updatedAt'],
    'Goals': ['goalId', 'userId', 'goalName', 'category', 'targetAmount', 'currentSavings', 'deadline', 'monthlyTarget', 'description', 'status', 'createdAt', 'updatedAt'],
    'SavingsTransactions': ['transactionId', 'goalId', 'amount', 'date', 'note', 'createdAt'],
    'Notifications': ['notificationId', 'userId', 'goalId', 'type', 'message', 'scheduledDate', 'sentStatus', 'createdAt'],
    'AIInsights': ['insightId', 'userId', 'goalId', 'insight', 'createdAt']
  };

  for (var sheetName in schemas) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(schemas[sheetName]);
      sheet.getRange(1, 1, 1, schemas[sheetName].length).setFontWeight('bold').setBackground('#f1f5f9');
      sheet.setFrozenRows(1);
    }
  }

  return { success: true, message: 'Google Sheets database successfully initialized with required schemas.' };
}

/**
 * Retrieves all goals for a user
 */
function getGoals(userId) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Goals');
  if (!sheet) return { success: true, data: [] };

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };

  var headers = data[0];
  var goals = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var goal = {};
    for (var j = 0; j < headers.length; j++) {
      goal[headers[j]] = row[j];
    }
    if (!userId || goal.userId === userId || goal.userId === 'user_default') {
      goals.push(goal);
    }
  }

  return { success: true, data: goals };
}

/**
 * Retrieves a single goal by ID along with its transactions
 */
function getGoal(goalId) {
  var ss = getSpreadsheet();
  var goalsSheet = ss.getSheetByName('Goals');
  if (!goalsSheet) return { success: false, message: 'Goals sheet not found' };

  var data = goalsSheet.getDataRange().getValues();
  var headers = data[0];
  var foundGoal = null;

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === goalId) {
      foundGoal = {};
      for (var j = 0; j < headers.length; j++) {
        foundGoal[headers[j]] = data[i][j];
      }
      break;
    }
  }

  if (!foundGoal) {
    return { success: false, message: 'Goal not found' };
  }

  // Fetch transactions for this goal
  var txSheet = ss.getSheetByName('SavingsTransactions');
  var transactions = [];
  if (txSheet) {
    var txData = txSheet.getDataRange().getValues();
    var txHeaders = txData[0];
    for (var k = 1; k < txData.length; k++) {
      if (txData[k][1] === goalId) {
        var tx = {};
        for (var m = 0; m < txHeaders.length; m++) {
          tx[txHeaders[m]] = txData[k][m];
        }
        transactions.push(tx);
      }
    }
  }

  foundGoal.transactions = transactions;
  return { success: true, data: foundGoal };
}

/**
 * Creates a new savings goal
 */
function createGoal(goalData) {
  var ss = getSpreadsheet();
  initializeSheetsDatabase();
  var sheet = ss.getSheetByName('Goals');

  var goalId = 'goal_' + Utilities.getUuid().substring(0, 8);
  var now = new Date().toISOString();

  var targetAmount = Number(goalData.targetAmount) || 0;
  var currentSavings = Number(goalData.currentSavings) || 0;
  var status = currentSavings >= targetAmount ? 'Completed' : 'Active';

  var row = [
    goalId,
    goalData.userId || 'user_default',
    goalData.goalName || 'Untitled Goal',
    goalData.category || 'Other',
    targetAmount,
    currentSavings,
    goalData.deadline || '',
    Number(goalData.monthlyTarget) || 0,
    goalData.description || '',
    status,
    now,
    now
  ];

  sheet.appendRow(row);

  // If initial savings were logged, record transaction
  if (currentSavings > 0) {
    var txSheet = ss.getSheetByName('SavingsTransactions');
    var txId = 'tx_' + Utilities.getUuid().substring(0, 8);
    txSheet.appendRow([txId, goalId, currentSavings, now.split('T')[0], 'Initial Savings deposit', now]);
  }

  return {
    success: true,
    data: { goalId: goalId, status: status },
    message: 'Savings goal created successfully.'
  };
}

/**
 * Adds savings to an existing goal and logs a transaction
 */
function addSavings(payload) {
  var ss = getSpreadsheet();
  var goalsSheet = ss.getSheetByName('Goals');
  var txSheet = ss.getSheetByName('SavingsTransactions');

  if (!goalsSheet || !txSheet) return { success: false, message: 'Database sheets missing.' };

  var goalId = payload.goalId;
  var amount = Number(payload.amount);
  if (!amount || amount <= 0) {
    return { success: false, message: 'Amount must be a positive number.' };
  }

  var data = goalsSheet.getDataRange().getValues();
  var goalRowIndex = -1;
  var currentSavings = 0;
  var targetAmount = 0;
  var goalName = '';

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === goalId) {
      goalRowIndex = i + 1; // 1-based index in Sheet
      currentSavings = Number(data[i][5]) || 0;
      targetAmount = Number(data[i][4]) || 0;
      goalName = data[i][2];
      break;
    }
  }

  if (goalRowIndex === -1) {
    return { success: false, message: 'Goal with ID ' + goalId + ' not found.' };
  }

  var newSavings = currentSavings + amount;
  var newStatus = newSavings >= targetAmount ? 'Completed' : 'Active';
  var now = new Date().toISOString();
  var txDate = payload.date || now.split('T')[0];
  var note = payload.note || 'Added savings';

  // Update currentSavings and status in Goals sheet
  goalsSheet.getRange(goalRowIndex, 6).setValue(newSavings);
  goalsSheet.getRange(goalRowIndex, 10).setValue(newStatus);
  goalsSheet.getRange(goalRowIndex, 12).setValue(now);

  // Append transaction
  var txId = 'tx_' + Utilities.getUuid().substring(0, 8);
  txSheet.appendRow([txId, goalId, amount, txDate, note, now]);

  // If goal completed with this deposit, create notification & trigger email
  if (newStatus === 'Completed' && currentSavings < targetAmount) {
    createNotificationRecord({
      userId: 'user_default',
      goalId: goalId,
      type: 'GOAL_COMPLETED',
      message: 'Congratulations! You reached your goal: ' + goalName
    });
    sendReminderEmail('GOAL_COMPLETED', goalId);
  }

  return {
    success: true,
    data: {
      goalId: goalId,
      newSavings: newSavings,
      targetAmount: targetAmount,
      status: newStatus,
      completed: newStatus === 'Completed'
    },
    message: 'Savings added successfully.'
  };
}

/**
 * Updates an existing goal
 */
function updateGoal(goalData) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Goals');
  if (!sheet) return { success: false, message: 'Goals sheet not found' };

  var data = sheet.getDataRange().getValues();
  var goalRowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === goalData.goalId) {
      goalRowIndex = i + 1;
      break;
    }
  }

  if (goalRowIndex === -1) {
    return { success: false, message: 'Goal not found' };
  }

  var targetAmount = Number(goalData.targetAmount) || 0;
  var currentSavings = Number(goalData.currentSavings) || 0;
  var status = currentSavings >= targetAmount ? 'Completed' : 'Active';
  var now = new Date().toISOString();

  sheet.getRange(goalRowIndex, 3).setValue(goalData.goalName);
  sheet.getRange(goalRowIndex, 4).setValue(goalData.category);
  sheet.getRange(goalRowIndex, 5).setValue(targetAmount);
  sheet.getRange(goalRowIndex, 6).setValue(currentSavings);
  sheet.getRange(goalRowIndex, 7).setValue(goalData.deadline);
  sheet.getRange(goalRowIndex, 8).setValue(Number(goalData.monthlyTarget) || 0);
  sheet.getRange(goalRowIndex, 9).setValue(goalData.description || '');
  sheet.getRange(goalRowIndex, 10).setValue(status);
  sheet.getRange(goalRowIndex, 12).setValue(now);

  return { success: true, message: 'Goal updated successfully.' };
}

/**
 * Deletes a goal and its associated records
 */
function deleteGoal(goalId) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('Goals');
  if (!sheet) return { success: false, message: 'Goals sheet not found' };

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === goalId) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Goal deleted successfully.' };
    }
  }

  return { success: false, message: 'Goal not found.' };
}

/**
 * Aggregates dashboard statistics
 */
function getDashboardData(userId) {
  var goalsRes = getGoals(userId);
  var goals = goalsRes.data || [];

  var totalSavings = 0;
  var totalTarget = 0;
  var activeGoals = 0;
  var completedGoals = 0;
  var overdueGoals = 0;
  var today = new Date();

  goals.forEach(function(g) {
    var target = Number(g.targetAmount) || 0;
    var saved = Number(g.currentSavings) || 0;
    totalSavings += saved;
    totalTarget += target;

    var deadline = g.deadline ? new Date(g.deadline) : null;
    var isPast = deadline && deadline < today;

    if (g.status === 'Completed' || saved >= target) {
      completedGoals++;
    } else if (isPast) {
      overdueGoals++;
    } else {
      activeGoals++;
    }
  });

  var overallProgress = totalTarget > 0 ? Math.round((totalSavings / totalTarget) * 100) : 0;

  return {
    success: true,
    data: {
      totalSavings: totalSavings,
      totalTarget: totalTarget,
      overallProgress: overallProgress,
      activeGoals: activeGoals,
      completedGoals: completedGoals,
      overdueGoals: overdueGoals,
      goalsCount: goals.length
    }
  };
}
