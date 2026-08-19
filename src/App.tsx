/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { initAmplitude } from './lib/amplitude';
import Layout from './components/Layout';
import DebugPanel from './components/DebugPanel';
import Home from './pages/Home';
import Funds from './pages/Funds';
import FundDetail from './pages/FundDetail';
import Simulator from './pages/Simulator';
import Register from './pages/Register';
import Login from './pages/Login';
import InvestApply from './pages/InvestApply';
import Success from './pages/Success';
import Recurring from './pages/Recurring';
import Dashboard from './pages/Dashboard';

export default function App() {
  useEffect(() => {
    initAmplitude();
  }, []);

  return (
    <HashRouter>
      <DebugPanel />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/funds/:id" element={<FundDetail />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/invest/apply" element={<InvestApply />} />
          <Route path="/invest/success" element={<Success />} />
          <Route path="/recurring" element={<Recurring />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
