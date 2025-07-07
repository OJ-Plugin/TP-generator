function encode64(text) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)))
}

function decode64(text) {
  return new TextDecoder().decode(Uint8Array.from(atob(text), (c) => c.charCodeAt(0)))
}