const STORAGE_KEY = "groups";

export const loadGroups = () =>
  JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

export const saveGroups = (groups) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
