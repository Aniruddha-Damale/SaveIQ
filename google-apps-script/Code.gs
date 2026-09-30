/**
 * SaveIQ - Google Apps Script Backend
 * Main Web App Entry Point (Code.gs)
 * 
 * Provides HTTP endpoints:
 * - doGet(e): Serves HTML or JSON API responses
 * - doPost(e): Handles API actions (createGoal, addSavings, generateAIInsight, runDailyFinancialAudit, etc.)
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'health';
  
  try {
    if (action === 'health') {
      return jsonResponse({
        success: true,
        message: 'SaveIQ Google Apps Script API is active and operational.',
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'getDashboardData') {
      return jsonResponse(getDashboardData(e.parameter.userId || 'user_default'));
    }
    
    if (action === 'getGoals') {
      return jsonResponse(getGoals(e.parameter.userId || 'user_default'));
    }
    
    if (action === 'getGoal') {
      return jsonResponse(getGoal(e.parameter.goalId));
    }
    
    if (action === 'getAnalyticsData') {
      return jsonResponse(getAnalyticsData(e.parameter.userId || 'user_default'));
    }
    
    return jsonResponse({
      success: false,
      message: 'Unknown GET action: ' + action
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      message: 'Server error: ' + err.toString()
    });
  }
}

function doPost(e) {
  try {
    var postData = {};
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    }
    
    var action = postData.action || (e && e.parameter && e.parameter.action);
    var payload = postData.payload || postData;
    
    switch (action) {
      case 'createGoal':
        return jsonResponse(createGoal(payload));
      case 'updateGoal':
        return jsonResponse(updateGoal(payload));
      case 'deleteGoal':
        return jsonResponse(deleteGoal(payload.goalId));
      case 'addSavings':
        return jsonResponse(addSavings(payload));
      case 'generateAIInsight':
        return jsonResponse(generateAIInsight(payload));
      case 'runDailyFinancialAudit':
        return jsonResponse(runDailyFinancialAudit(payload.userId));
      case 'sendReminderEmail':
        return jsonResponse(sendReminderEmail(payload.type, payload.goalId, payload.email));
      case 'updateProfile':
        return jsonResponse(updateUserProfile(payload));
      case 'initDatabase':
        return jsonResponse(initializeSheetsDatabase());
      default:
        return jsonResponse({
          success: false,
          message: 'Unknown POST action: ' + action
        });
    }
  } catch (err) {
    return jsonResponse({
      success: false,
      message: 'Request execution error: ' + err.toString()
    });
  }
}

/**
 * Formats data into a valid Google Apps Script JSON ContentService response.
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
