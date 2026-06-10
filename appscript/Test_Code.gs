// ============================================================
//  Code.gs — Priority Matrix 웹앱 진입점
//  SHEET_ID를 아래에 직접 입력하세요.
// ============================================================

const SHEET_ID = ""; // 👈 여기에 Google Sheets ID를 입력하세요

// ------------------------------------------------------------------
//  내부 유틸
// ------------------------------------------------------------------

function _resolveSheetId() {
  if (SHEET_ID) return SHEET_ID;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss.getId();
  throw new Error("SHEET_ID를 Code.gs 상단에 입력하세요.");
}

function _cors(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ------------------------------------------------------------------
//  스프레드시트 메뉴
// ------------------------------------------------------------------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Priority Matrix")
    .addItem("🗄️ DB 초기화 (전체 삭제 후 재생성)", "initializeDB")
    .addItem("🔄 스키마 업데이트 (데이터 유지)", "updateSchema")
    .addToUi();
}

// ------------------------------------------------------------------
//  DB 초기화 — 전체 삭제 후 빈 DB 재생성
//  · GUIDE 시트 삭제
//  · tasks / completed / settings 시트 삭제 후 헤더와 함께 재생성
// ------------------------------------------------------------------

function initializeDB() {
  const sheetId = _resolveSheetId();
  PriorityMatrixLibrary.resetDB(sheetId);

  const ss = SpreadsheetApp.openById(sheetId);
  const guide = ss.getSheetByName("GUIDE");
  if (guide) ss.deleteSheet(guide);

  const msg = "✅ DB 초기화 완료\n\ntasks / completed / settings 시트가 초기화되었습니다." +
    (guide ? "\nGUIDE 시트를 삭제했습니다." : "");
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
}

// ------------------------------------------------------------------
//  스키마 업데이트 — 데이터를 유지하며 헤더만 최신 버전으로 동기화
//  라이브러리 업데이트 후 헤더가 변경된 경우 실행
// ------------------------------------------------------------------

function updateSchema() {
  PriorityMatrixLibrary.migrateSchema(_resolveSheetId());
  const msg = "✅ 스키마 업데이트 완료\n\n헤더가 최신 버전으로 동기화되었습니다.";
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
}

// ------------------------------------------------------------------
//  웹앱 엔드포인트
// ------------------------------------------------------------------

function doGet(e) {
  const action = e.parameter.action || "getTasks";
  PriorityMatrixLibrary.initPriorityMatrix(_resolveSheetId());
  return _cors(PriorityMatrixLibrary.callPublicAPI(action, e.parameter));
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  PriorityMatrixLibrary.initPriorityMatrix(_resolveSheetId());
  return _cors(PriorityMatrixLibrary.callPublicAPI(body.action, body));
}
