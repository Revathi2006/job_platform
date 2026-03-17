/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { mockJobs, mockApplications } from '../mockData';

// Constants
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

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_USER:
      return {
        ...state,
        user: action.payload
      };

    case ACTION_TYPES.SET_JOBS:
      return {
        ...state,
        jobs: action.payload
      };

    case ACTION_TYPES.SET_APPLICATIONS:
      return {
        ...state,
        applications: action.payload
      };

    case ACTION_TYPES.ADD_JOB:
      // Update mock data
      mockJobs.push(action.payload);
      return {
        ...state,
        jobs: [...state.jobs, action.payload]
      };

    case ACTION_TYPES.UPDATE_JOB: {
      const jobIndex = mockJobs.findIndex(j => j.jobid === action.payload.jobid);
      if (jobIndex !== -1) {
        mockJobs[jobIndex] = action.payload;
      }
      return {
        ...state,
        jobs: state.jobs.map(job => 
          job.jobid === action.payload.jobid ? action.payload : job
        )
      };
    }

    case ACTION_TYPES.DELETE_JOB: {
      const deleteJobIndex = mockJobs.findIndex(j => j.jobid === action.payload);
      if (deleteJobIndex !== -1) {
        mockJobs.splice(deleteJobIndex, 1);
      }
      
      // Also delete related applications
      const relatedApps = state.applications.filter(a => a.job.jobid === action.payload);
      relatedApps.forEach(app => {
        const appIndex = mockApplications.findIndex(a => a.appid === app.appid);
        if (appIndex !== -1) {
          mockApplications.splice(appIndex, 1);
        }
      });
      
      return {
        ...state,
        jobs: state.jobs.filter(job => job.jobid !== action.payload),
        applications: state.applications.filter(a => a.job.jobid !== action.payload)
      };
    }

    case ACTION_TYPES.ADD_APPLICATION:
      mockApplications.push(action.payload);
      return {
        ...state,
        applications: [...state.applications, action.payload]
      };

    case ACTION_TYPES.UPDATE_APPLICATION_STATUS: {
      const appIndex = mockApplications.findIndex(a => a.appid === action.payload.appid);
      if (appIndex !== -1) {
        mockApplications[appIndex] = { 
          ...mockApplications[appIndex], 
          status: action.payload.status 
        };
      }
      
      return {
        ...state,
        applications: state.applications.map(app => 
          app.appid === action.payload.appid 
            ? { ...app, status: action.payload.status } 
            : app
        )
      };
    }

    case ACTION_TYPES.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case ACTION_TYPES.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load employer data when user changes
  useEffect(() => {
    if (state.user?.role === 'employer') {
      loadEmployerData();
    } else if (state.user?.role === 'jobseeker') {
      loadJobSeekerData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user]);

  const loadEmployerData = () => {
    if (!state.user?.username) return;
    
    const employerJobs = mockJobs.filter(job => job.employer === state.user.username);
    dispatch({ type: ACTION_TYPES.SET_JOBS, payload: employerJobs });
    
    if (employerJobs.length > 0) {
      const employerJobIds = employerJobs.map(job => job.jobid);
      const relevantApps = mockApplications.filter(app => 
        employerJobIds.includes(app.job.jobid)
      ).map(app => ({
        ...app,
        status: app.status || "APPLIED"
      }));
      dispatch({ type: ACTION_TYPES.SET_APPLICATIONS, payload: relevantApps });
    } else {
      dispatch({ type: ACTION_TYPES.SET_APPLICATIONS, payload: [] });
    }
  };

  const loadJobSeekerData = () => {
    if (!state.user?.username) return;
    
    const userApps = mockApplications.filter(a => a.jobseeker === state.user?.username);
    dispatch({ type: ACTION_TYPES.SET_APPLICATIONS, payload: userApps });
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Safe version of useAppContext that doesn't throw
export const useSafeAppContext = () => {
  const context = useContext(AppContext);
  return context; // Returns undefined if no provider
};

// Original useAppContext that throws (for when you want the error)
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};