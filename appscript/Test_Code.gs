// ============================================================
//  통합 템플릿 Code.gs — 컨테이너-바운드 (Sheet 내부)
//  SHEET_ID를 아래에 직접 입력하거나, 비워두면 현재 스프레드시트를 자동 사용
// ============================================================

const SHEET_ID_OVERRIDE = ""; // 👈 여기에 Google Sheets ID를 입력하세요 (비워두면 현재 시트 사용)

function _resolveSheetId() {
  if (SHEET_ID_OVERRIDE) return SHEET_ID_OVERRIDE;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss.getId();
  throw new Error("SHEET_ID를 설정하거나, 스프레드시트에 컨테이너-바운드로 배포하세요.");
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Priority Matrix")
    .addItem("🔄 최신 업데이트 적용", "applyLatestUpdate")
    .addSeparator()
    .addItem("📋 라이브러리 설정", "showLibraryInfo")
    .addToUi();
}

function applyLatestUpdate() {
  try {
    const result = PriorityMatrixLibrary.updateToLatest();
    const message = result.message + "\n\n현재 버전: " + result.version;
    SpreadsheetApp.getUi().alert(message);
  } catch (err) {
    SpreadsheetApp.getUi().alert("❌ 오류: " + err.message + "\n\n라이브러리가 추가되어 있는지 확인하세요.");
  }
}

function showLibraryInfo() {
  const ui = SpreadsheetApp.getUi();
  const sheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  const message = "Priority Matrix 설정\n\n" +
    "📌 Sheet ID: " + sheetId + "\n\n" +
    "🔄 \"최신 업데이트 적용\" 버튼을 클릭하여\n" +
    "라이브러리 업데이트를 확인할 수 있습니다.";
  ui.alert(message);
}

function _cors(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

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
