import {ReactFlowProvider} from "@xyflow/react";
import {useShallow} from 'zustand/react/shallow';
import Flow from '@/Flow.tsx';
import LoginPage from '@/components/pages/LoginPage.tsx';
import Dashboard from '@/components/pages/Dashboard.tsx';
import useStore from '@/store.ts';
import Settings from "@/components/pages/Settings.tsx";

function App() {
    const {token, currentCanvasId, settingsOpen} = useStore(
        useShallow((s) => ({token: s.token, currentCanvasId: s.currentCanvasId, settingsOpen: s.settingsOpen}))
    );

    if (settingsOpen) return <Settings/>;

    if (!token) return <LoginPage/>;
    if (!currentCanvasId) return <Dashboard/>;

    return (
        <ReactFlowProvider>
            <Flow/>
        </ReactFlowProvider>
    );
}

export default App;
