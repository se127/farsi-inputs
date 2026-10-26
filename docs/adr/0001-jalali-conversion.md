# Use jalaali-js for Jalali conversion

The Date picker needs exact Jalali/Gregorian conversion and leap-year month lengths, which are easy to get subtly wrong. We use `jalaali-js@2.0.1` for that math and keep the Day grid, Persian formatting, and keyboard model in our own code. A full date library such as `date-fns-jalali` would add a larger API surface for little benefit, and hand-rolled conversion was rejected as too risky.

The dependency is hard to replace later without touching every date calculation, which is why the choice is recorded here.
