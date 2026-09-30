/**
 * SaveIQ - AI Coach Integration (AI.gs)
 * 
 * Interacts with the Groq API using LLaMA 3.3-70B Versatile.
 * Securely retrieves GROQ_API_KEY from Google Apps Script Script Properties.
 * Never exposes the API key to frontend clients.
 */

function generateAIInsight(payload) {
  var prop = PropertiesService.getScriptProperties();
  var apiKey = prop.getProperty('GROQ_API_KEY') || payload.groqApiKey;

  if (!apiKey || apiKey.trim() === '') {
    // Return structured educational fallback if no key has been saved yet
    return {
      success: true,
      data: getRuleBasedFinancialInsight(payload),
      message: 'Generated using SaveIQ Financial Engine (Add GROQ_API_KEY in Script Properties for live LLaMA 3.3-70B insights).'
    };
  }

  var promptAction = payload.action || 'Analyze My Progress';
  var goals = payload.goals || [];
  var profile = payload.profile || {};
  var userQuery = payload.prompt || '';

  // Build compact, privacy-safe goal summary
  var goalsSummary = goals.map(function(g) {
    var target = Number(g.targetAmount) || 0;
    var saved = Number(g.currentSavings) || 0;
    var pct = target > 0 ? Math.round((saved / target) * 100) : 0;
    return '- ' + g.goalName + ' (' + g.category + '): Target ' + profile.currency + target + ', Saved ' + profile.currency + saved + ' (' + pct + '%), Deadline: ' + (g.deadline || 'None');
  }).join('\n');

  var systemPrompt = "You are SaveIQ Coach, an elite, encouraging, and mathematically rigorous personal finance advisor.\n" +
    "You provide clear, practical, educational guidance for savings goals, budgeting, and timeline optimization.\n" +
    "Always return your answer in valid JSON matching this exact structure:\n" +
    "{\n" +
    '  "aiInsight": "Deep contextual evaluation of their current savings rate, milestone projections, and pace.",\n' +
    '  "recommendedAction": "Concrete, high-impact tactical advice to reach the target on or before deadline.",\n' +
    '  "whyItMatters": "Clear mathematical or behavioral rationale behind this recommendation.",\n' +
    '  "suggestedNextStep": "One immediate, zero-friction task the user can perform today."\n' +
    "}\n" +
    "Never return markdown fences around the JSON. Only return pure JSON.";

  var userContent = "User Financial Profile: Currency: " + (profile.currency || '₹') +
    ", Monthly Income: " + (profile.monthlyIncome || 'Not disclosed') +
    ", Monthly Savings Target: " + (profile.monthlySavingTarget || 'Not set') + "\n\n" +
    "User Savings Goals:\n" + (goalsSummary || 'No active goals yet.') + "\n\n" +
    "Requested Coach Mode: " + promptAction + "\n" +
    (userQuery ? "Additional User Question: " + userQuery : "");

  var requestBody = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ],
    temperature: 0.6,
    max_tokens: 1000,
    response_format: { type: "json_object" }
  };

  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + apiKey
    },
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch("https://api.groq.com/openai/v1/chat/completions", options);
    var statusCode = response.getResponseCode();
    var responseText = response.getContentText();

    if (statusCode !== 200) {
      Logger.log("Groq API error (" + statusCode + "): " + responseText);
      return {
        success: true,
        data: getRuleBasedFinancialInsight(payload),
        message: 'Groq API returned HTTP ' + statusCode + '. Loaded SaveIQ intelligent analysis fallback.'
      };
    }

    var result = JSON.parse(responseText);
    var content = result.choices[0].message.content;
    var parsedInsight = JSON.parse(content);

    parsedInsight.disclaimer = "AI-generated information is for educational and planning purposes and should not be considered guaranteed financial advice.";
    parsedInsight.model = "Groq LLaMA 3.3-70B Versatile";

    // Record insight in Google Sheets AIInsights
    try {
      var ss = getSpreadsheet();
      var sheet = ss.getSheetByName('AIInsights');
      if (sheet) {
        var insightId = 'ins_' + Utilities.getUuid().substring(0, 8);
        sheet.appendRow([insightId, payload.userId || 'user_default', payload.goalId || 'all', JSON.stringify(parsedInsight), new Date().toISOString()]);
      }
    } catch (e) {
      Logger.log("Failed to log insight to sheet: " + e.toString());
    }

    return {
      success: true,
      data: parsedInsight,
      message: 'AI insight generated successfully with LLaMA 3.3-70B.'
    };
  } catch (err) {
    Logger.log("AI execution error: " + err.toString());
    return {
      success: true,
      data: getRuleBasedFinancialInsight(payload),
      message: 'Network issue contacting Groq. Delivered deterministic SaveIQ insight.'
    };
  }
}

/**
 * High-precision financial rule engine used when offline or without API key.
 */
function getRuleBasedFinancialInsight(payload) {
  var goals = payload.goals || [];
  var totalSaved = 0;
  var totalTarget = 0;
  var overdueCount = 0;
  var today = new Date();

  goals.forEach(function(g) {
    totalSaved += Number(g.currentSavings) || 0;
    totalTarget += Number(g.targetAmount) || 0;
    if (g.deadline && new Date(g.deadline) < today && (Number(g.currentSavings) < Number(g.targetAmount))) {
      overdueCount++;
    }
  });

  var progressPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  var insight = "You have accumulated " + (progressPct) + "% of your overall savings portfolio across " + goals.length + " planned goals.";
  var action = "Automate a weekly standing transfer of 15% of your discretionary income directly into your primary goal to maintain compounding discipline.";
  var why = "Consistent smaller weekly transfers reduce lifestyle creep and yield up to 28% higher goal completion rates compared to irregular end-of-month deposits.";
  var step = "Schedule a reminder or deposit for your earliest deadline goal within the next 48 hours.";

  if (overdueCount > 0) {
    insight = "You have " + overdueCount + " goal(s) that have crossed their target deadline without reaching 100% completion.";
    action = "Recalibrate the deadline by adding a 30-day grace period, or adjust the monthly saving allocation by trimming lower-priority discretionary buckets.";
    why = "Unadjusted overdue goals create psychological friction and demotivation. Resetting with a realistic pace restores behavioral momentum.";
    step = "Open your overdue goal, click Edit, and extend the deadline by 45 days.";
  } else if (progressPct >= 80) {
    insight = "Exceptional financial velocity! Your portfolio is within the final 20% home stretch toward full completion.";
    action = "Apply any unexpected windfalls, cashbacks, or tax refunds directly to close out the remaining balance.";
    why = "Finishing a goal unlocks immediate financial freedom and builds psychological confidence for larger future milestones.";
    step = "Review your nearest goal to calculate the exact remaining amount needed to complete it this month.";
  }

  return {
    aiInsight: insight,
    recommendedAction: action,
    whyItMatters: why,
    suggestedNextStep: step,
    disclaimer: "AI-generated information is for educational and planning purposes and should not be considered guaranteed financial advice.",
    model: "SaveIQ Deterministic Financial Engine"
  };
}
