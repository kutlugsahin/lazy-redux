import {connect} from 'react-redux';
import {bindActionCreators, createStore, combineReducers, compose, applyMiddleware} from 'redux';

let _setters = {};
let _reducers;
let _store;
let _actions;

const actionTypeKey = '@@__SET_REDUCER__';

const createReducer = function(name, init) {
  return (state = init, action) => {
    if (action.type.indexOf(`${actionTypeKey}${name}__`) > -1) {
      return action.data;
    } else {
      return state;
    }
  }
}

const createReducers = function(defs) {
  let reducers;
  if (Array.isArray(defs)) {
    reducers = defs.reduce((acc, def) => {
      acc[def.name] = createReducer(def.name, def.state);
      return acc;
    }, {}); 
  } else {
    reducers = Object.keys(defs).reduce((acc, key) => {
      acc[key] = createReducer(key, defs[key]);
      return acc;
    }, {});
  }

  _reducers = reducers;
  return _reducers;
}

const setStore = function(store) {
  _store = store;

  for (let key in _reducers) {
    _setters[key] = {
      set: (state, mark) => {
        const action = {
          type: `${actionTypeKey}${name}__${mark || ''}`,
          data: state
        };
        console.log('action dispatched :', action.type);
        store.dispatch(action);
      }
    }
  }

  return store;
}

function createAsyncThunkMiddleware(extraArgument) {
  return ({ getState }) => next => action => {
    if (typeof action === 'function') {
      if (Object.getPrototypeOf(action).constructor.name === 'GeneratorFunction') {
        var asy = require('async_polyfill');
        return asy(action)(_setters, getState, extraArgument);
      }

      return action(_setters, getState, extraArgument);
    }

    return next(action);
  };
}

const asyncThunk = createAsyncThunkMiddleware();
asyncThunk.withExtraArgument = createAsyncThunkMiddleware;

const lazyConnect = (stateToPropArr) => (component) => {
  let mapActions = (dispatch) => {
    return {
      actions: bindActionCreators(_actions, dispatch)
    }
  }

  let mapState = stateToPropArr ? (state) => {
    return stateToPropArr.reduce((acc, key) => {
      acc[key] = state[key];
      return acc;
    }, {});
  } : null;

  return connect(mapState, mapActions)(component);
} 

const lazyCreateStore = (reducerDefinitions, actions, middlewares, ...enhancers) => {
  _actions = actions;
  let _mds = middlewares || [];
  _mds = !Array.isArray(_mds) ? [_mds] : _mds;
  _mds.splice(0,0,asyncThunk);
  return setStore(createStore(combineReducers(createReducers(reducerDefinitions)), compose(applyMiddleware.apply(null, _mds), ...enhancers)));
}

export {
  lazyCreateStore as createStore,
  lazyConnect as connect
};
