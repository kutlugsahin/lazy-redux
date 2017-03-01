# Lazy-Redux

An opinionated version of redux for fast prototyping. No action types, no reducers with switch cases.
But still redux is used internally.

Installation
---------------------


```bash
npm install --save lazy-redux
```

Create Store
--------------------------
Action and reducer definitions are passed to ```createStore``` function to populate reducers internally,

```javascript
import {createStore} from 'lazy-redux';
import * as actions from 'my/path/to/actions';

const reducerDefinitions = {
	ui : { loading: false, isLeftPanelOpen: false } // <reducer-name> : <initial-state>
	...
	...
};

const store = createStore(reducerDefinitions, actions /* ,middleswares, enhancer */);

let root = <Provider store={store}><App/></Provider>;
``` 
Actions
----------------
Actions should return a function (normal function, async function or generator function) with two parameter.
First parameter is the object whose keys are reducer names and values are the setter funtion.
Second one is the classical getState param of thunk middleware.
An example of action.js is as follows.
``` javascript 
export function setUILoading(isLoading){
	return ({ui}, getState) => {
		ui.set({loading: isLoading});
	}
}
```
Or async functions like
``` javascript 
export function getUsers(){
	return async function({ui, users}, getState){
		ui.set({loading: true});
		let users = await api.get('example.com/users'); // api.get function is assumed to be a promise. 
		users.set(users);
		ui.set({loading:false});
	}
}
```
or generator function
``` javascript 
export function getUsers(){
	return function* ({ui, users}, getState){
		ui.set({loading: true});
		let users = yield api.get('example.com/users');
		...
	}
}
```
For the example above, actually there is a reducer named 'ui' (which you defined at createStore stage)generated by lazy-redux and a set function is defined for every reducer to set the new state. You can access any reducer setter from the first param of the returning function.
Connect
--------------------
Simplified connect function of ```react-redux```. No ```mapDispatchToProps``` function required. The actions are passed to component props as ```actions```. ```mapStateToProps``` is simplified to an array of reducer names.

```javascript
import React, { Component } from 'react';
import { connect } from 'lazy-redux';
class MyComponent extends Component {
  render() {
    return (
      <div>
        {this.props.ui.loading ? 'loading...' : 'ready!'}
        <button onClick={()=> {this.props.actions.getUsers(); }}>load</button>
      </div>
    );
  }
}

// actions are mapped to "this.props.actions" by default
// an array of reducers to be mapped to props are passed to connect function
export default connect(['ui'])(MyComponent);