import { createEffect, useComponentEffects, useEffect$, useFromEvent, useObservable } from '@ngneat/react-rxjs';
import { interval, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';
import { ChangeEvent, useState } from 'react';

const searchTodoEffect = createEffect((searchTerm$: Observable<string>) => {
  return searchTerm$.pipe(
    debounceTime(300),
    tap({
      next(v) {
        console.log(v);
      }
    })
  );
});

function SearchComponent() {
  const searchTodo = useComponentEffects(searchTodoEffect);

  return <input onChange={({ target: { value } }) => searchTodo(value)} />
}

function loadTodos() {
  return fromFetch<{ id: number }[]>('https://jsonplaceholder.typicode.com/todos', {
    selector: (response) => response.json(),
  }).pipe(
    tap({
      next(todos) {
        console.log(todos);
      },
    })
  );
}


const counter$ = interval(2000);

export function App() {
  const [show, setShow] = useState(true);
  const [sideEffect, setSideEffect] = useState(1)
  const [count] = useObservable(counter$, { initialValue: 0 });
  const [text, setText] = useState('');
  useEffect$(() => loadTodos(), [sideEffect]);

  const { ref } = useFromEvent<ChangeEvent<HTMLInputElement>>('keyup', (event$) =>
    event$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap((event) => {
        console.log(event);
        setText(event.target.value)
      })
    )
  );

  return (
    <section>
      {count}
      <button onClick={() => setSideEffect(e => e + 1)}>sideEffect</button>
      <button onClick={() => setShow(show => !show)}>Toggle</button>
      {show && <SearchComponent />}

      <h1>useFromEvent</h1>
      <h3>{text}</h3>

      {show && <input ref={ref} />}
    </section>
  )
}

export default App;
