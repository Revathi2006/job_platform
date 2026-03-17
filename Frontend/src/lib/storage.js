// src/lib/storage.js

const safeJsonParse = (value) => {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

export const loadJson = (key, fallback) => {
  const parsed = safeJsonParse(localStorage.getItem(key));
  return parsed === undefined ? fallback : parsed;
};

export const saveJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const STORAGE_KEYS = {
  savedJobIds: 'sh_saved_job_ids',
  applications: 'sh_applications',
  selectedJobId: 'sh_selected_job_id'
};

