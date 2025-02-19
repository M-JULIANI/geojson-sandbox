import NavBar from './components/NavBar';
import { SolutionList } from './components/SolutionList';
import { ErrorBoundary } from 'react-error-boundary';
import { MapView } from './components/map/Map';
import { Metrics, MetricsContainer } from './components/metrics/Metrics';

const Layout = () => {
  return (
    <div className="h-screen flex flex-col">
      <NavBar />

      {/* Main content */}
      <div className="flex-1 pt-24">
        {' '}
        {/* pt-16 matches navbar height */}
        <div className="grid grid-cols-6 h-full">
          {/* left column - 1/6 width */}
          <div className="border-r overflow-auto">
            <ErrorBoundary fallback={<div>Something went wrong loading solutions</div>}>
              <SolutionList />
            </ErrorBoundary>
          </div>

          {/* middle column - 4/6 width */}
          <div className="col-span-4 border-r">
            <div className="h-full w-full">
              <ErrorBoundary fallback={<div>Something went wrong with the map</div>}>
                <MapView />
              </ErrorBoundary>
            </div>
          </div>

          {/* right column - 1/6 width */}
          <div className="overflow-auto">
            <ErrorBoundary fallback={<div>Something went wrong with metrics</div>}>
              <MetricsContainer />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
