function sendPushNotificationToOneSignal(title, message) {
  var appId = "73a96bf6-8439-4452-b6ae-53d97d28c89f"; 
  var apiKey = PropertiesService.getScriptProperties().getProperty("ONESIGNAL_REST_API_KEY");
  if (!apiKey) {
    Logger.log("OneSignal push skipped: ONESIGNAL_REST_API_KEY is not configured.");
    return false;
  }
  
  var payload = {
    "app_id": appId,
    "included_segments": ["All"],
    "headings": {"en": title},
    "contents": {"en": message}
  };
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "headers": {
      "Authorization": "Basic " + apiKey
    },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  try {
    var response = UrlFetchApp.fetch("https://onesignal.com/api/v1/notifications", options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    Logger.log("OneSignal response " + responseCode + ": " + responseText);
    var responseData = JSON.parse(responseText);
    var hasErrors = responseData.errors && (!Array.isArray(responseData.errors) || responseData.errors.length > 0);
    return responseCode >= 200 && responseCode < 300 && !!responseData.id && !hasErrors;
  } catch (err) {
    Logger.log("Push failed: " + err.toString());
    return false;
  }
}

function sendTelegramAlert(msg, imageBlob) {
  sendTelegramAlertToConfiguredBot_(msg, imageBlob, "SALES_TELEGRAM_BOT_TOKEN", "SALES_TELEGRAM_CHAT_ID");
}

function sendReplacementTelegramAlert(msg, imageBlob) {
  sendTelegramAlertToConfiguredBot_(msg, imageBlob, "REPLACEMENT_TELEGRAM_BOT_TOKEN", "REPLACEMENT_TELEGRAM_CHAT_ID");
}

function sendTelegramAlertToConfiguredBot_(msg, imageBlob, tokenProperty, chatProperty) {
  var properties = PropertiesService.getScriptProperties();
  var botToken = properties.getProperty(tokenProperty);
  var chatId = properties.getProperty(chatProperty);
  if (!botToken || !chatId) {
    throw new Error("Telegram configuration is missing script properties: " + tokenProperty + " and/or " + chatProperty);
  }

  if (imageBlob) {
    var photoUrl = "https://api.telegram.org/bot" + botToken + "/sendPhoto";
    var payloadPhoto = {
      "chat_id": chatId,
      "photo": imageBlob,
      "caption": msg,
      "parse_mode": "Markdown"
    };
    
    try {
      var response1 = UrlFetchApp.fetch(photoUrl, {
        "method": "post",
        "payload": payloadPhoto,
        "muteHttpExceptions": true
      });
      var result1 = JSON.parse(response1.getContentText());
      
      if (result1.ok) return; 
      
      Logger.log("Telegram photo send failed: " + (result1.description || "Unknown Telegram API error."));
    } catch (e) {
      Logger.log("Telegram photo send failed: " + e.toString());
    }

    var docUrl = "https://api.telegram.org/bot" + botToken + "/sendDocument";
    var payloadDoc = {
      "chat_id": chatId,
      "document": imageBlob,
      "caption": "⚠️ _Photo dimensions exceeded Telegram limits. Sent as raw document._\n\n" + msg,
      "parse_mode": "Markdown"
    };
    
    try {
      var response2 = UrlFetchApp.fetch(docUrl, {
        "method": "post",
        "payload": payloadDoc,
        "muteHttpExceptions": true
      });
      var result2 = JSON.parse(response2.getContentText());
      
      if (result2.ok) return; 
      
      Logger.log("Telegram document send failed: " + (result2.description || "Unknown Telegram API error."));
    } catch (e) {
      Logger.log("Telegram document send failed: " + e.toString());
    }
  }

  var textUrl = "https://api.telegram.org/bot" + botToken + "/sendMessage";
  try {
    var response = UrlFetchApp.fetch(textUrl, {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify({
        "chat_id": chatId,
        "text": imageBlob ? msg + "\n\n⚠️ *SYSTEM NOTE:* Live photo upload failed. Please use the Drive Backup Link above to view the screenshot." : msg,
        "parse_mode": "Markdown"
      })
    });
    var result = JSON.parse(response.getContentText());
    if (!result.ok) throw new Error(result.description || "Telegram text message failed.");
  } catch (e) {
    Logger.log("Telegram text send with Markdown failed: " + e.toString());
    var fallbackResponse = UrlFetchApp.fetch(textUrl, {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify({ "chat_id": chatId, "text": msg }),
      "muteHttpExceptions": true
    });
    var fallbackResult = JSON.parse(fallbackResponse.getContentText());
    if (!fallbackResult.ok) throw new Error(fallbackResult.description || "Telegram text message failed.");
  }
}