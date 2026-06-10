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
//  스프레드시트 메뉴 (컨테이너-바운드 시 자동 등록)
// ------------------------------------------------------------------

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Priority Matrix")
    .addItem("🗄️ DB 초기화 (최초 1회)", "initializeDB")
    .addSeparator()
    .addItem("✅ 라이브러리 연동 테스트", "testLibraryConnection")
    .addItem("➕ settings 추가 테스트", "testSettingsAdd")
    .addItem("➖ settings 삭제 테스트", "testSettingsRemove")
    .addToUi();
}

// ------------------------------------------------------------------
//  1. DB 초기화 — 최초 1회 실행
//     - tasks / completed / settings 시트 생성
//     - GUIDE 시트가 있으면 삭제
// ------------------------------------------------------------------

function initializeDB() {
  PriorityMatrixLibrary.initPriorityMatrix(_resolveSheetId());

  const ss = SpreadsheetApp.openById(_resolveSheetId());
  const guide = ss.getSheetByName("GUIDE");
  if (guide) ss.deleteSheet(guide);

  const msg = "✅ DB 초기화 완료\n\ntasks / completed / settings 시트가 준비되었습니다." +
    (guide ? "\nGUIDE 시트를 삭제했습니다." : "");
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
}

// ------------------------------------------------------------------
//  2. settings 추가 테스트
// ------------------------------------------------------------------

function testSettingsAdd() {
  PriorityMatrixLibrary.initPriorityMatrix(_resolveSheetId());
  const result = PriorityMatrixLibrary.callPublicAPI("saveSettings", {
    settings: { _test_key: "hello_from_test" }
  });
  const msg = result.ok
    ? "✅ settings 추가 성공\n_test_key = hello_from_test"
    : "❌ 실패: " + JSON.stringify(result);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
}

// ------------------------------------------------------------------
//  3. settings 삭제 테스트 (_test_key 행 직접 삭제)
// ------------------------------------------------------------------

function testSettingsRemove() {
  const ss = SpreadsheetApp.openById(_resolveSheetId());
  const sh = ss.getSheetByName("settings");
  if (!sh) { Logger.log("settings 시트 없음"); return; }

  const data = sh.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === "_test_key") {
      sh.deleteRow(i + 1);
      const msg = "✅ settings 삭제 성공\n_test_key 행을 제거했습니다.";
      try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
      return;
    }
  }
  const msg = "⚠️ _test_key를 찾지 못했습니다. 먼저 추가 테스트를 실행하세요.";
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
}

// ------------------------------------------------------------------
//  4. 라이브러리 연동 테스트
// ------------------------------------------------------------------

function testLibraryConnection() {
  try {
    const result = PriorityMatrixLibrary.ping();
    const msg = "✅ 라이브러리 연동 성공\n" + JSON.stringify(result);
    try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
  } catch (err) {
    const msg = "❌ 라이브러리 연동 실패\n" + err.message +
      "\n\n라이브러리가 추가되어 있는지 확인하세요.";
    try { SpreadsheetApp.getUi().alert(msg); } catch (e) { Logger.log(msg); }
  }
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
