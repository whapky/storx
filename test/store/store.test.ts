import { GenericCallbackTestContext, test } from 'ava-ts';
import { map, skip, tap } from 'rxjs/operators';
import { Store } from '../../src/store/index';

type Ctx<T = any> = GenericCallbackTestContext<T>;
interface Box<T = number> {
  value: T;
}

const willAssert = <T>(t: Ctx, store: (arg?: any) => any, expected: T) => {
  store()
    .pipe(map(s => t.deepEqual(s, expected)))
    .subscribe(t.end);
};

const testStore = (value, ...effects) =>
  Store(
    { value },
    {
      dec: ({ value: v1 }: Box, { value: v2 }: Box) => ({ value: v1 - v2 }),
      inc: ({ value: v1 }: Box, { value: v2 }: Box) => ({ value: v1 + v2 })
    },
    ...effects
  );

test.cb('dispatching bound action updates primitive state accordingly', t => {
  const store = Store(1, { inc: (state, patch) => state + patch });

  willAssert(t, store, 4);

  store(['inc', 3]);
});

test.cb('dispatching bound action updates complex state accordingly', t => {
  const store = testStore(1);

  willAssert(t, store, { value: 4 });

  store(['inc', { value: 3 }]);
});

test.cb('dispatching free action updates primitive state accordingly', t => {
  const store = Store(42, {});

  willAssert(t, store, 50);

  store((x: number) => x + 8);
});

test.cb('dispatching free action updates complex state accordingly', t => {
  const store = Store({ value: 42 }, {});

  willAssert(t, store, { value: 50 });

  store(({ value }: Box) => ({ value: value + 8 }));
});

test.cb('consequent changes are getting applied correctly', t => {
  const store = testStore(42);

  store()
    .pipe(
      skip(2),
      map(s => t.deepEqual(s, { value: 60 }))
    )
    .subscribe(t.end);

  store(['inc', { value: 5 }]);
  store(({ value }: Box) => ({ value: value + 15 }));
  store(['dec', { value: 2 }]);
});

test.cb('late subscribers receive up-to-date state', t => {
  const store = testStore(42);

  store(['inc', { value: 5 }]);
  store(({ value }: Box) => ({ value: value + 15 }));
  store(['inc', { value: 8 }]);

  store()
    .pipe(map(s => t.deepEqual(s, { value: 70 })))
    .subscribe(t.end);
});

test.cb('effects are triggered', t => {
  let counter = 0;
  const store = testStore(0, () => counter++);

  store(['inc', { value: 42 }]);
  store(['inc', { value: 42 }]);

  store()
    .pipe(tap(() => t.deepEqual(counter, 2)))
    .subscribe(() => t.end());
});

test.cb('effects are triggered per action rather than per subscriber', t => {
  let counter = 0;
  const store = testStore(0, () => counter++);

  store().subscribe(() => t.log('subscribed before any actions were taken'));

  store(['inc', { value: 42 }]);
  store(['inc', { value: 42 }]);

  store()
    .pipe(tap(() => t.deepEqual(counter, 2)))
    .subscribe(() => t.end());
});
