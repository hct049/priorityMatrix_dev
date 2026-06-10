// ============================================================
//  우선순위 매트릭스 — Google Apps Script 라이브러리
//  사용자의 Apps Script 프로젝트에 "라이브러리"로 추가해서 사용
//  SHEET_ID는 사용자가 PropertiesService에 설정
// ============================================================

const TASKS_SHEET = "tasks";
const COMPLETED_SHEET = "completed";
const SETTINGS_SHEET = "settings";

const TASK_HEADERS = [
  "id", "title", "deadline", "deadlineTime", "importance", "note",
  "repeat", "repeatInterval", "repeatWeekdays", "autoRepeat", "memos", "createdAt", "deletedAt"
];
const COMPLETED_HEADERS = [
  "id", "title", "deadline", "deadlineTime", "importance", "note",
  "repeat", "repeatInterval", "repeatWeekdays", "memos", "completedAt"
];

function _getSheetId() {
  const id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  if (!id) throw new Error("SHEET_ID not set. Call initPriorityMatrix(sheetId) first.");
  return id;
}

function _getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.openById(_getSheetId());
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length)
      .setBackground("#1a1a2e").setFontColor("#00D4AA").setFontWeight("bold");
  }
  return sh;
}

function _sheetToObjects(sh, headers) {
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return [];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      let v = row[i];
      if (h === "repeatWeekdays" || h === "memos") {
        try { v = JSON.parse(v || "[]"); } catch (e) { v = []; }
      }
      if (h === "importance" || h === "repeatInterval") v = Number(v) || 0;
      obj[h] = v;
    });
    return obj;
  });
}

function _findRowById(sh, id) {
  if (sh.getLastRow() < 2) return -1;
  const ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat();
  const sid = String(id);
  const idx = ids.findIndex(v => String(v) === sid);
  return idx === -1 ? -1 : idx + 2;
}

function _objectToRow(obj, headers) {
  return headers.map(h => {
    const v = obj[h];
    if (Array.isArray(v)) return JSON.stringify(v);
    return v === undefined ? "" : v;
  });
}

function initPriorityMatrix(sheetId) {
  PropertiesService.getScriptProperties().setProperty("SHEET_ID", sheetId);
  _getOrCreateSheet(TASKS_SHEET, TASK_HEADERS);
  _getOrCreateSheet(COMPLETED_SHEET, COMPLETED_HEADERS);
  _getOrCreateSheet(SETTINGS_SHEET, ["key", "value"]);
}

function getTasks() {
  const sh = _getOrCreateSheet(TASKS_SHEET, TASK_HEADERS);
  return { ok: true, data: _sheetToObjects(sh, TASK_HEADERS) };
}

function addTask(task) {
  const sh = _getOrCreateSheet(TASKS_SHEET, TASK_HEADERS);
  task.id = task.id || String(Date.now());
  task.createdAt = task.createdAt || new Date().toISOString();
  sh.appendRow(_objectToRow(task, TASK_HEADERS));
  return { ok: true, id: task.id };
}

function updateTask(task) {
  const sh = _getOrCreateSheet(TASKS_SHEET, TASK_HEADERS);
  const row = _findRowById(sh, task.id);
  if (row === -1) return { ok: false, error: "Not found" };
  sh.getRange(row, 1, 1, TASK_HEADERS.length).setValues([_objectToRow(task, TASK_HEADERS)]);
  return { ok: true };
}

function deleteTask(id) {
  const sh = _getOrCreateSheet(TASKS_SHEET, TASK_HEADERS);
  const row = _findRowById(sh, id);
  if (row === -1) return { ok: false, error: "Not found" };
  sh.deleteRow(row);
  return { ok: true };
}

function getCompleted() {
  const sh = _getOrCreateSheet(COMPLETED_SHEET, COMPLETED_HEADERS);
  return { ok: true, data: _sheetToObjects(sh, COMPLETED_HEADERS) };
}

function completeTask(id, completedTask) {
  const shT = _getOrCreateSheet(TASKS_SHEET, TASK_HEADERS);
  const row = _findRowById(shT, id);
  if (row !== -1) shT.deleteRow(row);
  const shC = _getOrCreateSheet(COMPLETED_SHEET, COMPLETED_HEADERS);
  shC.appendRow(_objectToRow(completedTask, COMPLETED_HEADERS));
  return { ok: true };
}

function undoComplete(id, task) {
  const shC = _getOrCreateSheet(COMPLETED_SHEET, COMPLETED_HEADERS);
  const row = _findRowById(shC, id);
  if (row !== -1) shC.deleteRow(row);
  const shT = _getOrCreateSheet(TASKS_SHEET, TASK_HEADERS);
  shT.appendRow(_objectToRow(task, TASK_HEADERS));
  return { ok: true };
}

function deleteCompleted(id) {
  const sh = _getOrCreateSheet(COMPLETED_SHEET, COMPLETED_HEADERS);
  const row = _findRowById(sh, id);
  if (row === -1) return { ok: false, error: "Not found" };
  sh.deleteRow(row);
  return { ok: true };
}

function updateMemos(id, memos, sheetName) {
  const isCompleted = sheetName === "completed";
  const headers = isCompleted ? COMPLETED_HEADERS : TASK_HEADERS;
  const sh = _getOrCreateSheet(isCompleted ? COMPLETED_SHEET : TASKS_SHEET, headers);
  const row = _findRowById(sh, id);
  if (row === -1) return { ok: false, error: "Not found" };
  const memoCol = headers.indexOf("memos") + 1;
  sh.getRange(row, memoCol).setValue(JSON.stringify(memos));
  return { ok: true };
}

function getSettings() {
  const ss = SpreadsheetApp.openById(_getSheetId());
  let sh = ss.getSheetByName(SETTINGS_SHEET);
  if (!sh) return { ok: true, data: {} };
  const data = sh.getDataRange().getValues();
  const result = {};
  data.slice(1).forEach(row => { if (row[0] && row[0] !== "key") result[String(row[0])] = row[1]; });
  return { ok: true, data: result };
}

function saveSettings(settings) {
  const ss = SpreadsheetApp.openById(_getSheetId());
  let sh = ss.getSheetByName(SETTINGS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(SETTINGS_SHEET);
    sh.getRange(1, 1, 1, 2).setValues([["key", "value"]]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, 2).setBackground("#1a1a2e").setFontColor("#00D4AA").setFontWeight("bold");
  }
  const existing = sh.getDataRange().getValues();
  const keyToRow = {};
  existing.forEach((row, i) => { if (i > 0 && row[0]) keyToRow[row[0]] = i + 1; });
  Object.entries(settings).forEach(([k, v]) => {
    const val = String(v);
    if (keyToRow[k]) { sh.getRange(keyToRow[k], 2).setValue(val); }
    else { sh.appendRow([k, val]); }
  });
  return { ok: true };
}

function ping() {
  return { ok: true, message: "PriorityMatrixLibrary 연동 정상", timestamp: new Date().toISOString() };
}

function callPublicAPI(action, params) {
  try {
    if (action === "getTasks") return getTasks();
    if (action === "getCompleted") return getCompleted();
    if (action === "getSettings") return getSettings();
    if (action === "addTask") return addTask(params.task);
    if (action === "updateTask") return updateTask(params.task);
    if (action === "deleteTask") return deleteTask(params.id);
    if (action === "completeTask") return completeTask(params.id, params.completedTask);
    if (action === "undoComplete") return undoComplete(params.id, params.task);
    if (action === "deleteCompleted") return deleteCompleted(params.id);
    if (action === "updateMemos") return updateMemos(params.id, params.memos, params.sheet);
    if (action === "saveSettings") return saveSettings(params.settings);
    return { error: "Unknown action: " + action };
  } catch (err) {
    return { error: err.message };
  }
}
