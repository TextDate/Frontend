import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import BaseModel from "@/pages/BaseModel/BaseModel";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/base" element={<BaseModel />} />
      </Routes>
  );
}

export default App;