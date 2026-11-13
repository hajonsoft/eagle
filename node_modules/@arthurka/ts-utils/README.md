## Usage

```ts
import { checkExactShape, ExactShape } from '@arthurka/ts-utils';

const tooFew = { first: 'Stefan' };
const exact = { first: 'Stefan', last: 'asd' };
const tooMany = { first: 'Stefan', last: 'asd', age: '37' };

const record: Record<string, string> = {};
type R = typeof record;
type Exact = typeof exact;
interface ExtendedRecord extends Exact, R {}
const extendedRecord: ExtendedRecord = {
  first: 'Stefan',
  last: 'asd',
  // asd: 'asd',
};

type Person = {
  first: string;
  last: string;
};


function savePerson<T>(person: ExactShape<T, Person>) {

}
savePerson(exact);
// @ts-expect-error
savePerson(tooFew);
// @ts-expect-error
savePerson(tooMany);
// @ts-expect-error
savePerson(record);
// @ts-expect-error
savePerson(extendedRecord);

function getPerson(): Person {
  const a = exact;
  // const a = tooFew;
  // const a = tooMany;
  // const a = record;
  // const a = extendedRecord;

  checkExactShape<Person>()(a);
  return a;
}

const person = getPerson();
console.info(person);
```
