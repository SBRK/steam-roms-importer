import { createAction } from 'redux-actions';
import { getConsoles } from '../service/Consoles.service';

const fetchConsolesLoading = createAction('FETCH_CONSOLES_LOADING');
const fetchConsolesError = createAction('FETCH_CONSOLES_ERROR');
const fetchConsolesSuccess = createAction('FETCH_CONSOLES_SUCCESS');

export const fetchConsoles = () => function fetchConsolesAction(dispatch) {
  dispatch(fetchConsolesLoading());

  return getConsoles()
    .then(consoles => dispatch(fetchConsolesSuccess(consoles)))
    .catch(error => dispatch(fetchConsolesError(error)));
};
