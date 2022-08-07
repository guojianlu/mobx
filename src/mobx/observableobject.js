import { getNextId, addHiddenProp, $mobx, getAdm, globalState } from './utils';

class ObservableValue {
  constructor(value) {
    this.value = value;
    this.observers = new Set(); //此可观察值的监听者，可以说观察者
  }
  get() {
    reportObserved(this);
    return this.value;
  }
  setNewValue(newValue) {
    this.value = newValue;
    propagateChanged(this);
  }
}

function propagateChanged(observableValue) {
  const { observers } = observableValue;
  observers.forEach((observer) => {
    observer.runReaction();
  });
}

function reportObserved(observableValue) {
  const trackingDerivation = globalState.trackingDerivation;
  if (trackingDerivation) {
    trackingDerivation.observing.push(observableValue);
  }
}

class ObservableObjectAdministration {
  constructor(target, values, name) {
    this.target = target;
    this.values = values; //存放属性的信息
    this.name = name;
  }
  get(key) {
    return this.target[key];
  }
  set(key, value) {
    if (this.values.has(key)) {
      return this.setObservablePropValue(key, value);
    }
  }
  extend(key, descriptor) {
    this.defineObservableProperty(key, descriptor.value); //name,1
  }
  setObservablePropValue(key, value) {
    const observableValue = this.values.get(key);
    observableValue.setNewValue(value);
    return true;
  }
  getObservablePropValue(key) {
    return this.values.get(key).get();
  }
  defineObservableProperty(key, value) {
    const descriptor = {
      configurable: true,
      enumerable: true,
      get() {
        return this[$mobx].getObservablePropValue(key);
      },
      set() {
        return this[$mobx].setObservablePropValue(key, value);
      },
    };
    Object.defineProperty(this.target, key, descriptor);
    this.values.set(key, new ObservableValue(value));
  }
}

function asObservableObject(target) {
  const name = `ObservableObject@${getNextId()}`;
  const adm = new ObservableObjectAdministration(target, new Map(), name);
  addHiddenProp(target, $mobx, adm); // target[$mobx]=adm
  return target;
}

const objectProxyTraps = {
  get(target, name) {
    return getAdm(target).get(name);
  },
  set(target, name, value) {
    return getAdm(target).set(name, value);
  },
};

function asDynamicObservableObject(target) {
  asObservableObject(target);
  const proxy = new Proxy(target, objectProxyTraps);
  return proxy;
}

function extendObservable(proxyObject, properties) {
  const descriptors = Object.getOwnPropertyDescriptors(properties);
  const adm = getAdm(proxyObject);
  Reflect.ownKeys(descriptors).forEach((key) => {
    adm.extend(key, descriptors[key]);
  });
  return proxyObject;
}

export function object(target) {
  const dynamicObservableObject = asDynamicObservableObject({});
  return extendObservable(dynamicObservableObject, target);
}
