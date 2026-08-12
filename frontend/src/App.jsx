import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import OutletPerformanceAgent from "./OutletPerformanceAgent";
import InventoryAgent from "./pages/InventoryAgent";
import MarketingAgent from "./pages/MarketingAgent";
import StaffAgent from "./pages/StaffAgent";
import AuditAgent from "./pages/AuditAgent";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Layout from "./components/Layout";

function App() {
  const [dark, setDark] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH ROUTES (FULL SCREEN) */}
        <Route path="/login" element={<LoginPage dark={dark} setDark={setDark} />} />
        <Route path="/signup" element={<SignUpPage dark={dark} setDark={setDark} />} />

        {/* AGENT ROUTES (WRAPPED IN SHARED LAYOUT) */}
        <Route
          path="/"
          element={
            <Layout dark={dark} setDark={setDark}>
              <OutletPerformanceAgent embedded={true} dark={dark} setDark={setDark} />
            </Layout>
          }
        />
        <Route
          path="/outlet-performance"
          element={
            <Layout dark={dark} setDark={setDark}>
              <OutletPerformanceAgent embedded={true} dark={dark} setDark={setDark} />
            </Layout>
          }
        />
        <Route
          path="/audit"
          element={
            <Layout dark={dark} setDark={setDark}>
              <AuditAgent />
            </Layout>
          }
        />
        <Route
          path="/inventory"
          element={
            <Layout dark={dark} setDark={setDark}>
              <InventoryAgent />
            </Layout>
          }
        />
        <Route
          path="/staff"
          element={
            <Layout dark={dark} setDark={setDark}>
              <StaffAgent />
            </Layout>
          }
        />
        <Route
          path="/marketing"
          element={
            <Layout dark={dark} setDark={setDark}>
              <MarketingAgent />
            </Layout>
          }
        />

        {/* CATCH ALL FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;