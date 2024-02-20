const SPEADSHEET_ID = 'GOOGLE_SPEADSHEET_ID';
const SPEADSHEET_SHEETNAME = 'Data';
// ---------------------------------------------
// Call test function before deploy to product
// ---------------------------------------------
function testUpdateData(){
  const objectC = {
    "parameter": {
      "action": "insert",
      "callback": "callback(e)",
      "uuid": "",
      "title": "Demo content",
      "content": "Demo content",
      "likeCount": 50,
      "dislikeCount": 20
    }  }
  doGet(objectC);

  const objectU = {
    "parameter": {
      "action": "update",
      "callback": "callback(e)",
      "uuid": "3a59ee00-9e49-4511-99ee-48e24d0b5582",
      "title": "Update: Demo content",
      "content": "Update: Demo content",
      "likeCount": 999,
      "dislikeCount": 999
    }  }
  doGet(objectU);
  
  const objectD = {
    "parameter": {
      "action": "delete",
      "callback": "callback(e)",
      "uuid": "750850ad-d2ae-46e6-b192-de69dee71b01",
      "title": "Update: Demo content",
      "content": "Update: Demo content",
      "likeCount": 50,
      "dislikeCount": 100
    }  }
  doGet(objectD);

  const objectR = {
    "parameter": {
      "action": "read",
      "callback": "callback(e)",
      "uuid": "",
      "title": "Demo content",
      "content": "Demo content",
      "likeCount": 50,
      "dislikeCount": 20
    }  }
  doGet(objectR);
}
function callback(e) {Logger.log(e)}

function doGet(e) {
    Logger.log(e);
    const vals = JSON.stringify(e);
    var op = e.parameter.action;
    var ss = SpreadsheetApp.open(DriveApp.getFileById(SPEADSHEET_ID));
    var sn = SPEADSHEET_SHEETNAME;
    var sheet = ss.getSheetByName(sn);

    console.log(vals);
    if (op == "insert")
        return insert_value(e, sheet);

    //Make sure you are sending proper parameters
    if (op == "read")
        return read_value(e, ss, sn);

    if (op == "update")
        return update_value(e, sheet);

    if (op == "delete")
        return delete_value(e, sheet);

    return HtmlService.createTemplateFromFile("crud").evaluate();
}

//Receive parameter and pass it to function to handle
function insert_value(request, sheet) {
    const uuid = Utilities.getUuid()
    var title = request.parameter.title;
    var content = request.parameter.content;
    var likeCount = 0;
    var dislikeCount = 0;

    if (!title) {
      return ContentService
          .createTextOutput(request.parameter.callback + "(" + JSON.stringify({"result": "The title must be not null!"}) + ")")
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    // Current time
    var datetimeNow = new Date();
    const currentDateTime = Utilities.formatDate(datetimeNow, 'Asia/Tokyo', 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'');
    
    var rowData = sheet.appendRow([uuid, title, content, likeCount, dislikeCount, currentDateTime, currentDateTime]);
    var result = "Insert successful";

    result = JSON.stringify({
        "result": result
    });

    Logger.log(JSON.stringify(result));
    return ContentService
        .createTextOutput(request.parameter.callback + "(" + result + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Read spreadsheet content
function read_value(request, ss, sheetName) {
    var output = ContentService.createTextOutput(), data = {};
    data.records = readData_(ss, sheetName);

    var callback = request.parameter.callback;
    if (callback === undefined) {
        output.setContent(JSON.stringify(data));
    } else {
        output.setContent(callback + "(" + JSON.stringify(data) + ")");
    }
    output.setMimeType(ContentService.MimeType.JAVASCRIPT);

    Logger.log("callback(" + JSON.stringify(data) + ")");
    return output;
}


function readData_(ss, sheetName, properties) {
    if (typeof properties == "undefined") {
        properties = getHeaderRow_(ss, sheetName);
        properties = properties.map(function (p) { return p.replace(/\s+/g, '_'); });
    }

    var rows = getDataRows_(ss, sheetName),
        data = [];

    for (var r = 0, l = rows.length; r < l; r++) {
        var row = rows[r],
            record = {};

        for (var p in properties) {
            record[properties[p]] = row[p];
        }

        data.push(record);

    }
    return data;
}

function getDataRows_(ss, sheetName) {
    var sh = ss.getSheetByName(sheetName);
    return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
}


function getHeaderRow_(ss, sheetName) {
    var sh = ss.getSheetByName(sheetName);
    return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
}

//Update function
function update_value(request, sheet) {
    var uuid = request.parameter.uuid;
    var title = request.parameter.title;
    var content = request.parameter.content;
    var likeCount = request.parameter.likeCount;
    var dislikeCount = request.parameter.dislikeCount;
    var datetimeNow = new Date();
    const currentDateTime = Utilities.formatDate(datetimeNow, 'Asia/Tokyo', 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'');

    var flag = 0;
    var lr = sheet.getLastRow();
    for (var i = 1; i <= lr; i++) {
        var ruuid = sheet.getRange(i, 1).getValue();
        if (ruuid == uuid) {
            sheet.getRange(i, 2).setValue(title);
            sheet.getRange(i, 3).setValue(content);
            sheet.getRange(i, 4).setValue(likeCount);
            sheet.getRange(i, 5).setValue(dislikeCount);
            sheet.getRange(i, 7).setValue(currentDateTime);
            var result = "value updated successfully";
            flag = 1;
        }
    }
    if (flag == 0)
        var result = "uuid not found";

    result = JSON.stringify({
        "result": result
    });

    Logger.log(JSON.stringify(result));
    return ContentService
        .createTextOutput(request.parameter.callback + "(" + result + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

//Detele function
function delete_value(request, sheet) {
    var uuid = request.parameter.uuid;
    var flag = 0;
    var lr = sheet.getLastRow();
    for (var i = 1; i <= lr; i++) {
        var ruuid = sheet.getRange(i, 1).getValue();
        if (ruuid == uuid) {
            sheet.deleteRow(i);
            var result = "value deleted successfully";
            flag = 1;
        }
    }
    if (flag == 0)
        var result = "uuid not found";

    result = JSON.stringify({
        "result": result
    });

    Logger.log(JSON.stringify(result));
    return ContentService
        .createTextOutput(request.parameter.callback + "(" + result + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
}