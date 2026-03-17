// constants.js
export const ACTION_TYPES = {
  SET_USER: 'SET_USER',
  SET_JOBS: 'SET_JOBS',
  SET_APPLICATIONS: 'SET_APPLICATIONS',
  ADD_JOB: 'ADD_JOB',
  UPDATE_JOB: 'UPDATE_JOB',
  DELETE_JOB: 'DELETE_JOB',
  ADD_APPLICATION: 'ADD_APPLICATION',
  UPDATE_APPLICATION_STATUS: 'UPDATE_APPLICATION_STATUS',
  SET_FILTERS: 'SET_FILTERS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  RESET_STATE: 'RESET_STATE'
};

export const initialState = {
  jobs: [],
  applications: [],
  user: null,
  loading: false,
  error: null,
  filters: {
    status: 'ALL',
    jobFilter: 'ALL',
    searchTerm: ''
  }
};