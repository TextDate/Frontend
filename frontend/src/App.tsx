import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import BaseModel from "@/pages/BaseModel/BaseModel";
import BinaryModel from "./pages/BinaryModel/BinaryModel";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/base" element={<BaseModel />} />
        <Route path="/binary" element={<BinaryModel />} />
      </Routes>
  );
}

export default App;