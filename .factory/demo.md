# Demo sandbox

Open `/demo` (or `/?demo=1`) to load the sample booking-page route. It is
available without an extension, account, or network request.

The sample contains five focus stops: menu, date chooser, next month, date
chooser again, and book appointment. It includes a focus-mark warning, a skip,
and a loop for reviewers to inspect.

Demo mode writes only `demo:krc:sample-report` in browser localStorage. The
banner's **Reset demo** control removes and recreates it. **Start for real**
returns home and never reads demo storage.
