const statusTitle = document.getElementById("splash-status-title");
const statusMessage = document.getElementById("splash-status-message");

const statusTitleMap = {
  READY: "앱 시작 준비",
  CHECKING: "업데이트 확인 중",
  UPDATE_AVAILABLE: "업데이트 다운로드 시작",
  DOWNLOADING: "업데이트 다운로드 중",
  DOWNLOADED: "업데이트 적용 준비",
  UP_TO_DATE: "최신 버전 확인 완료",
  CHECK_FAILED: "업데이트 확인 실패",
  DEV_MODE: "개발 모드 실행",
};

window.erpSplash.onStatus((payload) => {
  statusTitle.textContent = statusTitleMap[payload.status] || "상태 확인 중";
  statusMessage.textContent = payload.message || "잠시만 기다려 주세요.";
});
