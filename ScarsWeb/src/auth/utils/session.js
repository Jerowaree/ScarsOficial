export const getToken = () => localStorage.getItem("token");

export const saveSession = (data) => {
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("role", data.role);
  if (data.name) localStorage.setItem("userName", data.name);
  else if (data.email) localStorage.setItem("userName", (data.email || "").split("@")[0]);
  window.dispatchEvent(new CustomEvent("session-updated"));
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userName");
  window.dispatchEvent(new CustomEvent("session-updated"));
};
