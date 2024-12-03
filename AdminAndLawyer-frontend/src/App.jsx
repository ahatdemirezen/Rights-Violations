import React from "react";
import Login from "./pages/Login";  
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";


const App = () => {
return ( 
  <Router>
      <div className="App">
      <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />  {/* Login rotası */}



      </Routes>
      </div>
  </Router>

)
}

export default App
