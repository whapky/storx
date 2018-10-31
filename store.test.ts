import { GenericCallbackTestContext, test } from 'ava-ts';
import { map } from 'rxjs/operators';
import { Store } from '.';

type Ctx<T = any> = GenericCallbackTestContext<T>;
interface IBoxed<T = number> { value: T; }

const willAssert = <T>(t: Ctx, store: (arg?: any) => any, expected: T) => {
  store().pipe(
    map((s) => t.deepEqual(s, expected)),
  ).subscribe(t.end);
};

test.cb('primitive state gets updated according to the rules specified by a bound reducer', (t) => {
  const store = Store(1, { inc: (state, patch) => state + patch });

  willAssert(t, store, 4);

  store({ action: 'inc', payload: 3 });
});

test.cb('complex state gets updated according to the rules specified by a bound reducer', (t) => {
  const store = Store(
    { value: 1 },
    { inc: ({ value: v1 }: IBoxed, { value: v2 }: IBoxed) => ({ value: v1 + v2 }) },
  );

  willAssert(t, store, { value: 4 });

  store({ action: 'inc', payload: { value: 3 } });
});

test.cb('primitive state gets updated according to the rules specified by a free reducer', (t) => {
  const store = Store(42, {});

  willAssert(t, store, 50);

  store((x: number) => x + 8);
});

test.cb('complex state gets updated according to the rules specified by a free reducer', (t) => {
  const store = Store({ value: 42 }, {});

  willAssert(t, store, { value: 50 });

  store(({ value }: IBoxed) => ({ value: value + 8 }));
});
