import { SolutonListProvider } from '@/contexts/WorkflowListContext';
import { ActiveWorkflowProvider } from '@/contexts/ActiveWorkflowContext';
import Layout from './Layout';

function App() {
    return (
        <SolutionListProvider>
            <ActiveWorkflowProvider>
                <Layout />
            </ActiveWorkflowProvider>
        </SolutionListProvider>
    );
}

export default App;
