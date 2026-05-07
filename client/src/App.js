import AppRouter from "./router";
import RouteErrorBoundary from "./components/providers/RouteErrorBoundary";
import ThemeProvider from "./components/providers/ThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <RouteErrorBoundary>
        <AppRouter />
      </RouteErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
