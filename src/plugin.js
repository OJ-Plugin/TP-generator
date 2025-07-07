function encode64(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

function decode64(base64) {
  return decodeURIComponent(escape(atob(base64)));
}