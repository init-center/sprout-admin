export default function backToPrevPage() {
  const referrer = document.referrer;
  const host = document.location.host;
  const href = document.location.href;
  const origin = document.location.origin;
  const referrerHost = referrer.split("/")[2];
  if (referrerHost === host && referrer !== href) {
    window?.history
      ? window.history?.back()
      : (document.location.href = referrer);
  } else {
    document.location.href = origin;
  }
}
