import React from 'react';
import store from './store'
import { Provider } from 'react-redux';
import { Consoles } from './components';

const App = () => <Provider store={store}><Consoles /></Provider>;

export default App;
