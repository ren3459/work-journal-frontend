import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TypesPage } from "./pages/TypesPage";
import { HomePage } from "./pages/HomePage";
import { MainLayout } from "./theme/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<TypesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
