const express = require('express');
const router = express.Router();
const path = require('path');

let thirtyDaysData = [];
try {
  thirtyDaysData = require('../data/30daysdummydata.json');
} catch (e) {
  console.warn('30-day data load notice:', e.message);
}

// Fallback points
const mockBusData = [
  { key: 'KIT-PUN-01', data: { latitude: 18.52043, longitude: 73.85674, aqi: 82, pm25: 28, pm10: 52 }, timestamp: Date.now() },
  { key: 'KIT-PUN-02', data: { latitude: 18.55965, longitude: 73.77978, aqi: 115, pm25: 42, pm10: 78 }, timestamp: Date.now() },
  { key: 'KIT-PUN-03', data: { latitude: 18.50892, longitude: 73.80789, aqi: 68, pm25: 21, pm10: 44 }, timestamp: Date.now() },
  { key: 'KIT-BOM-01', data: { latitude: 19.07609, longitude: 72.87742, aqi: 142, pm25: 58, pm10: 95 }, timestamp: Date.now() },
  { key: 'KIT-BOM-02', data: { latitude: 19.11364, longitude: 72.86973, aqi: 165, pm25: 72, pm10: 118 }, timestamp: Date.now() },
  { key: 'KIT-DEL-01', data: { latitude: 28.61393, longitude: 77.20902, aqi: 210, pm25: 110, pm10: 185 }, timestamp: Date.now() },
  { key: 'KIT-DEL-02', data: { latitude: 28.65054, longitude: 77.30271, aqi: 245, pm25: 135, pm10: 210 }, timestamp: Date.now() },
  { key: 'KIT-BLR-01', data: { latitude: 12.97159, longitude: 77.59456, aqi: 55, pm25: 18, pm10: 36 }, timestamp: Date.now() },
  { key: 'KIT-MAA-01', data: { latitude: 13.08268, longitude: 80.27071, aqi: 92, pm25: 34, pm10: 62 }, timestamp: Date.now() }
];

// /api/aqi_values/bus-data/all
router.get('/aqi_values/bus-data/all', (req, res) => {
  if (thirtyDaysData && thirtyDaysData.length > 0) {
    const busPoints = thirtyDaysData.slice(-30).map((item, idx) => ({
      key: `BUS-${101 + idx}`,
      data: {
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        aqi: item.aqi,
        pm25: item.pm25,
        pm10: item.pm10
      },
      timestamp: new Date(item.timestamp_utc).getTime()
    }));
    return res.json({ status: 'success', data: busPoints });
  }
  res.json({ status: 'success', data: mockBusData });
});

// /api/hourly
router.get('/hourly', (req, res) => {
  if (thirtyDaysData && thirtyDaysData.length >= 24) {
    const last24 = thirtyDaysData.slice(-24).map((item, idx) => ({
      date: item.timestamp_utc.slice(0, 10),
      hour: idx,
      aqi: item.aqi,
      pm25: item.pm25,
      pm10: item.pm10,
      co: item.co,
      no2: item.no2,
      so2: parseFloat((item.no2 * 0.4).toFixed(1)),
      o3: item.o3
    }));
    return res.json({ status: 'success', data: last24 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const data = [];
  for (let hour = 0; hour < 24; hour++) {
    const aqi = Math.round(70 + Math.sin(hour / 3) * 35 + (hour > 8 && hour < 20 ? 30 : 0));
    data.push({
      date: today,
      hour: hour,
      aqi: aqi,
      pm25: Math.round(aqi * 0.42),
      pm10: Math.round(aqi * 0.75),
      co: parseFloat((0.4 + Math.random() * 0.5).toFixed(2)),
      no2: parseFloat((18 + Math.random() * 20).toFixed(1)),
      so2: parseFloat((8 + Math.random() * 8).toFixed(1)),
      o3: parseFloat((12 + Math.random() * 15).toFixed(1))
    });
  }
  res.json({ status: 'success', data });
});

// /api/weekly
router.get('/weekly', (req, res) => {
  const now = new Date();
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const aqi = Math.round(85 + Math.random() * 40);
    data.push({
      week_start: d.toISOString().slice(0, 10),
      aqi: aqi,
      pm25: Math.round(aqi * 0.42),
      pm10: Math.round(aqi * 0.75),
      co: 0.6,
      no2: 26,
      so2: 11,
      o3: 16
    });
  }
  res.json({ status: 'success', data });
});

// /api/monthly
router.get('/monthly', (req, res) => {
  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
  const data = months.map((m, idx) => {
    const aqi = Math.round(90 + Math.cos(idx / 2) * 30);
    return {
      month: m,
      aqi: aqi,
      pm25: Math.round(aqi * 0.42),
      pm10: Math.round(aqi * 0.75),
      co: 0.7,
      no2: 24,
      so2: 10,
      o3: 18
    };
  });
  res.json({ status: 'success', data });
});

// /api/aqi/faq-query
router.post('/aqi/faq-query', (req, res) => {
  const { name, email, query } = req.body;
  console.log('📝 Received FAQ Query from:', name, email, '-', query);
  res.json({
    status: 'success',
    message: 'Your query has been submitted successfully!'
  });
});

module.exports = router;
