import NavBar from './components/NavBar';
import { SolutionList } from './components/SolutionList';
import { ErrorBoundary } from 'react-error-boundary';
import { MapView } from './components/Map';

const Layout = () => {
  return (
    <div className="min-h-screen">
      {/* fixed nav */}
      <NavBar />

      {/* Main content with grid */}
      <div className="pt-24">
        {' '}
        {/* padding-top to account for fixed nav */}
        <div className="grid grid-cols-4 min-h-[calc(100vh-4rem)]">
          {/* left column - 1/4 width */}
          <div className="border-r p-0">
            <ErrorBoundary fallback={<div>Something went wrong loading solutions</div>}>
              <SolutionList />
            </ErrorBoundary>
          </div>

          {/* middle column - 2/4 width */}
          <div className="col-span-2 border-r">
            <div style={{ width: '100%', height: '100%' }}>
              <ErrorBoundary fallback={<div>Something went wrong with the map</div>}>
                <MapView />
              </ErrorBoundary>
            </div>
          </div>

          {/* right column - 1/4 width */}
          <div>
            <h2 className="text-2xl p-4">Statistics</h2>
            <p className="text-gray-400 p-4">Tools available for selected solution</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
