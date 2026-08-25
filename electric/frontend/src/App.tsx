import Signinpage from "./pages/signinpage";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ToastProvider>
      <Signinpage />
    </ToastProvider>
  );
}

export default App;