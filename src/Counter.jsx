import React from 'react';
import { makeAutoObservable } from 'mobx';
import {
  useObserver,
  Observer,
  observer,
  useLocalObservable,
} from './mobx-react';

// class Store {
//   number = 0;
//   constructor() {
//     makeAutoObservable(this, {}, { autoBind: true });
//   }
//   add() {
//     this.number++;
//   }
// }

// const store = new Store();

// export default function Counter() {
//   return useObserver(() => {
//     return (
//       <div>
//         <p>{store.number}</p>
//         <button onClick={store.add}>+</button>
//       </div>
//     );
//   });
// }

// export default function Counter() {
//   return (
//     <Observer>
//       {() => (
//         <div>
//           <p>{store.number}</p>
//           <button onClick={store.add}>+</button>
//         </div>
//       )}
//     </Observer>
//   );
// }

// export default observer(function Counter() {
//   return (
//     <div>
//       <p>{store.number}</p>
//       <button onClick={store.add}>+</button>
//     </div>
//   );
// });

// @observer
// class Counter extends React.Component {
//   render() {
//     return (
//       <div>
//         <p>{store.number}</p>
//         <button onClick={store.add}>+</button>
//       </div>
//     );
//   }
// }

// export default Counter;

export default function Counter() {
  const store = useLocalObservable(() => ({
    number: 1,
    add() {
      this.number++;
    },
  }));
  return useObserver(() => (
    <div>
      <p>{store.number}</p>
      <button onClick={store.add}>+</button>
    </div>
  ));
}
