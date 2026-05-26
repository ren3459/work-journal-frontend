import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TypeWorkPage } from "./pages/TypeWorkPage";
import { HomePage } from "./pages/HomePage";
import { MainLayout } from "./theme/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/typeWork" element={<TypeWorkPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
