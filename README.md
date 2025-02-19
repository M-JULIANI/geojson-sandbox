# Forma Takehome

This repo attempts to implement the `State Management` takehome assignment.

### Prerequisites

- You will need to have `node` and `npm` installed.
- You will need a my .env file which contains the mapbox api key.

## Commands

```bash
npm install
npm run dev
npm test
```

## Design

### State Management

In order to manage state, I chose to create two context providers:

- SolutionListProvider: This provider manages the list of solutions.
- ActiveSolutionProvider: This provider manages the active solution.

In App.tsx:

```tsx
<SolutionListProvider>
  <ActiveSolutionProvider>
    <Layout />
  </ActiveSolutionProvider>
</SolutionListProvider>
```

Some of the benefits of this approach:

- This approach allows us to decouple how the data is fetched / injected into memory from management of the active solution. This also allows us to evolve the management of the active solution independently of the management of the list of solutions.
- Downstream componentts can consume either the list in its entirety, or a single solution as needed.

The `Layout` component serves as the scaffolding, where the navigation and the different columns are defined.

### ActiveSolutionProvider

This context provider is the most important one to be able to accomplish some of the functionality we want in the task. The reason for this is that it allows us to lift shared state to be shared between <MapView> and <Toolbar> components. Because we are opereating directly on geojson, and geojson is basically a flat list of features, we can (at least initially) use the indeces of features to perform operations on them. For that reason we can use our `updateFeatures()` method to update the active solution using only the opration taype and the targetIndeces, per below. If we were dealing with a nested JSON tree this would have to be rethought.

```tsx
const { updateFeatures } = useActiveSolution();
updateFeatures({
  type: PolygonOperation.UNION,
  targetFeatureIndices: [0, 1],
});
```

### Interactions

The `MapView` component serves as the main component for map interactions. We can basically select polygons (thereby updateding the selection state), which in turn triggers the `Toolbar` visibility as toolbar actions become available.

### Map

Using the Mapbox GL JS library, as it provides an easy way to render geojson, and provides many convenience methods for auto-navigating to the active solution `map.flyTo()` for instance.

### Geometry & Ops

Using the turf.js library, which is pretty well known for geometry / boolean operations.
