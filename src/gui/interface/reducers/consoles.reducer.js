import { handleActions } from 'redux-actions';

const initialState = {
  consoles: {},
  error: null,
  loading: false,
};

export default handleActions({
  FETCH_CONSOLES_ERROR: (state, { payload: error }) => {
    console.error('Error loading consoles', { error });

    return {
      ...state,
      loading: false,
      consoles: null,
      error,
    };
  },

  FETCH_CONSOLES_LOADING: state => ({
    ...state,
    loading: true,
    error: null,
    consoles: null,
  }),

  FETCH_CONSOLES_SUCCESS: (state, { payload: consoles }) => {
    return {
      ...state,
      loading: false,
      error: null,
      consoles,
    };
  },

}, initialState);
