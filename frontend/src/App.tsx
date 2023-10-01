import { Component, ReactNode, RefObject, createRef } from 'react';
import './App.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { ControlArea } from './control-area/Control-area';

export class App extends Component {
  constructor() {
    super({});
  }
  render(): ReactNode {
    return (
      <Provider store={store}>
      <div className="App">
        <ControlArea/>
      </div>
      </Provider>
    );   
  }
}

export default App;
