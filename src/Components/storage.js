const STORAGE_KEY = "groups";

const cleanMembers = (members) =>
  members.map((member) => member.trim()).filter(Boolean);

// accepts comma- or newline-separated names, e.g. a column pasted from a spreadsheet
export const parseMembers = (text) => cleanMembers(text.split(/[,\n]/));

export const loadGroups = () =>
  JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]").map((group) => ({
    ...group,
    members: cleanMembers(group.members),
  }));

export const saveGroups = (groups) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
