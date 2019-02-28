import { Context, GenericTestContext, test } from 'ava-ts';
import { guard } from '../utils/guard';
import { isFunction } from '../utils/type-assertions';

const type = (name: string) => (x: any) => Object.is(typeof x, name);

function macro<E>(
  t: GenericTestContext<Context<any>>,
  input: any,
  [ pred, typeName ]: [(x: any) => boolean, string]
) {
  if (guard<E>(input, pred)) {
    const _typeAssert: E = input;
    t.deepEqual(typeof input, typeName);
  } else {
    t.fail();
  }
}

test('function type is correctly inferred', macro, function() {}, [
  isFunction,
  'function'
]);

test('arrow function type is correctly inferred', macro, () => {}, [
  isFunction,
  'function'
]);

test('object type is correctly inferred', macro, {}, [
  type('object'),
  'object'
]);

test('number type is correctly inferred', macro, 42, [
  type('number'),
  'function'
]);
