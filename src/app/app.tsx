import { Note } from '../components/Note';
import { Toolbar } from '../components/Toolbar';

export function App() {
  return (
    <div className="grid h-full grid-rows-[auto_1fr]">
        <Toolbar />
        <div className="relative p-4">
          <Note />
        </div>
        
    </div>
  );
}

export default App;
