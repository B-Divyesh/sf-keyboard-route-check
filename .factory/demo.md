# Demo sandbox

Open `/?demo=1` (or `/demo`) to load the sample booking-page route. It is
available without an extension, account, or network request.

The sample contains five focus stops: menu, date chooser, next month, date
chooser again, and book appointment. It includes a focus-mark warning, a skip,
and a loop for reviewers to inspect.

Demo mode writes only `demo:krc:sample-report` in browser localStorage. The
persistent banner's **Reset demo** control removes and recreates it. **Start for
real** removes the demo key, returns home, and never reads demo storage. The
landing page's **Try it with sample data** link opens `/?demo=1` in one click.
