const YOUR_SPREADSHEET_ID = 'GOOGLE_SPEADSHEET_ID';
function testing() {
  const objectD = {
    "parameter": {
      "hub.mode": "delete",
      "hub.verify_token": 12345,
      "hub.challenge": 789123
    }  }
  doGet(objectD);
}

function doPost(e) {
  saveToExcel(JSON.stringify(e), "POST");
  return ContentService.createTextOutput(JSON.stringify('Your data have been saved!!!'));
}

function doGet(e) {
  saveToExcel(JSON.stringify(e), "GET");

  // Parse the query params
  var mode = e.parameter["hub.mode"];
  var token = e.parameter["hub.verify_token"];
  var challenge = e.parameter["hub.challenge"];

  // var mode = e.parameter.query["hub.mode"]
  // var token = e.parameter.query["hub.verify_token"];
  // var challenge = e.parameter.query["hub.challenge"];

  // Check if a token and mode is in the query string of the request
  if (mode === "subscribe" && token === "12345") {
      // Respond with the challenge token from the request
      return ContentService.createTextOutput(challenge);
    } else {
      result = {
          'statusCode': 403,
          'message': 'You do not have access to this resource.'
      }
      return ContentService.createTextOutput(JSON.stringify(result));
  }
}


function saveToExcel(data, mode) {
  // Get Spreadsheet file
  var spreadsheet = SpreadsheetApp.openById(YOUR_SPREADSHEET_ID);
  var sheet = spreadsheet.getSheets()[0];

  // LastRaw
  var lastRow = sheet.getLastRow();
  
  // Current time
  const currentDateTime = new Date();

  // Insert to Spreadsheet
  sheet.getRange(lastRow + 1, 1).setValue(Utilities.formatDate(currentDateTime, 'Asia/Tokyo', 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''));
  sheet.getRange(lastRow + 1, 2).setValue(mode);
  sheet.getRange(lastRow + 1, 3).setValue(data);
}