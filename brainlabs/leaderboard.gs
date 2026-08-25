// Brain Labs shared leaderboard backend (Google Apps Script).
// Setup: 1) sheets.new -> name it "Brain Labs scores"
//        2) Extensions -> Apps Script -> replace the default code with this file -> Save
//        3) Deploy -> New deployment -> type "Web app" ->
//           Execute as: Me / Who has access: Anyone -> Deploy -> authorize -> copy the /exec URL
//        4) Send that URL back to Claude to wire into the apps.
// Every score lands as a row in the sheet, so you can inspect, delete, or clear rows any time.

var SHEET = 'scores';
var TOP_N = 10;
var MAX_ROWS = 20000;

function doGet(e) {
  var board = String((e && e.parameter && e.parameter.board) || '').slice(0, 60);
  return json_(top_(board));
}

function doPost(e) {
  var b = {};
  try { b = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false }); }
  var board = String(b.board || '').slice(0, 60);
  var name = String(b.name || 'anon').replace(/[^\w .\-']/g, '').slice(0, 12) || 'anon';
  var score = Math.max(0, Math.min(1000, Math.round(Number(b.score) || 0)));
  if (!board) return json_({ ok: false });
  var lock = LockService.getScriptLock();
  lock.tryLock(5000);
  try {
    var sh = sheet_();
    if (sh.getLastRow() < MAX_ROWS) sh.appendRow([new Date(), board, name, score]);
  } finally { lock.releaseLock(); }
  return json_(top_(board));
}

function top_(board) {
  var sh = sheet_();
  var last = sh.getLastRow();
  var rows = last ? sh.getRange(1, 1, last, 4).getValues() : [];
  var top = [];
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][1] !== board) continue;
    top.push({ n: String(rows[i][2]).slice(0, 12), s: Number(rows[i][3]) || 0, d: fmt_(rows[i][0]) });
  }
  top.sort(function (a, b) { return b.s - a.s; });
  return { ok: true, board: board, top: top.slice(0, TOP_N) };
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
}
function fmt_(d) { try { return Utilities.formatDate(new Date(d), 'America/Los_Angeles', 'MM-dd'); } catch (e) { return ''; } }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
