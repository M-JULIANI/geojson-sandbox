import { SolutionListProvider } from '@/contexts/SolutionListContext';
import { ActiveSolutionProvider } from '@/contexts/ActiveSolutionContext';
import Layout from './Layout';

function App() {
  return (
    <SolutionListProvider>
      <ActiveSolutionProvider>
        <Layout />
      </ActiveSolutionProvider>
    </SolutionListProvider>
  );
}

export default App;
