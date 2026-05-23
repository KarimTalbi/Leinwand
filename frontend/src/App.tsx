import {ReactFlowProvider} from "@xyflow/react";
import {useShallow} from 'zustand/react/shallow';
import Flow from '@/Flow.tsx';
import LoginPage from '@/components/pages/LoginPage.tsx';
import Dashboard from '@/components/pages/Dashboard.tsx';
import useStore from '@/store.ts';

function App() {
    const {token, currentCanvasId} = useStore(
        useShallow((s) => ({token: s.token, currentCanvasId: s.currentCanvasId}))
    );

    if (!token) return <LoginPage/>;
    if (!currentCanvasId) return <Dashboard/>;

    return (
        <ReactFlowProvider>
            <Flow/>
        </ReactFlowProvider>
    );
}

export default App;
