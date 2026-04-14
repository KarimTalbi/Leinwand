import {ReactFlowProvider} from "@xyflow/react";
import Flow from './Flow.tsx'
import './App.css';

function App() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    );
}

export default App;