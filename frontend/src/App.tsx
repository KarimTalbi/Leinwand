import {ReactFlowProvider} from "@xyflow/react";
import Flow from '@/Flow.tsx';

function App() {

  return (
    <ReactFlowProvider>
      <Flow/>
    </ReactFlowProvider>
  );
}

export default App;
