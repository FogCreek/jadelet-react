### Iteration

There currently isn't really a solution for iteration in Jadelet under jadelet-react.

### Rendering Jadelet within Jadelet

Rendering Jadelet within Jadelet is going to cause issues when first migrating, because the JadeletWrapper handles rerendering. If, for example, we wanted to start this by rendering the whole application in a single JadeletWrapper element, we would probably have issues because any change under that JadeletWrapper requires the whole JadeletWrapper to be rerendered. I believe this can be handled with nested JadeletWrappers.

### Removing conditionals in Jadelet templates

Jadelet templates under jadelet-react cannot have conditionals because that will change the observables that the nearest JadeletWrapper should be observing. To maintain performance, we should observe all the necessary observables once when the JadeletWrapper is rendered, and then unobserved with the component unmounts.