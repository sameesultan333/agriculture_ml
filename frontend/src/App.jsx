import { Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import CreateTrade from "./pages/CreateTrade";
import TradeHistory from "./pages/TradeHistory";
import Analytics from "./pages/Analytics";
import AnalyticsChart from "./pages/AnalyticsChart";
import MarketRates from "./pages/MarketRates";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateTrade />} />
        <Route path="/history" element={<TradeHistory />} />
        <Route path="/analytics" element={<Analytics />} />
         <Route path="/chart" element={<AnalyticsChart />} />
         <Route path="/market" element={<MarketRates />} />
   
      </Route>
    </Routes>
  );
}
