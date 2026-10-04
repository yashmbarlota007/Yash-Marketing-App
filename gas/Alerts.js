function sendPushNotificationToOneSignal(title, message) {
  var appId = "73a96bf6-8439-4452-b6ae-53d97d28c89f"; 
  var apiKey = "73a96bf6-8439-4452-b6ae-53d97d28c89f"; 
  
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
    Logger.log(response.getContentText());
  } catch (err) {
    Logger.log("Push failed: " + err.toString());
  }
}

function sendTelegramAlert(msg, imageBlob) {
  var botToken = "8847444782:AAH9jA8ijqthLBec62eY22gYyuD-ggjMtx0"; 
  var chatId = "8975979526"; 

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
      
    } catch (e) {} 

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
      
    } catch (e) {}
  }

  var textUrl = "https://api.telegram.org/bot" + botToken + "/sendMessage";
  try {
    UrlFetchApp.fetch(textUrl, {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify({
        "chat_id": chatId,
        "text": msg + "\n\n⚠️ *SYSTEM NOTE:* Live photo upload failed. Please use the Drive Backup Link above to view the screenshot.",
        "parse_mode": "Markdown"
      }),
      "muteHttpExceptions": true
    });
  } catch (e) {
    UrlFetchApp.fetch(textUrl, {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify({ "chat_id": chatId, "text": msg })
    });
  }
}