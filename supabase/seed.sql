-- ==============================================
-- ParkShare — Seed Data (Optional)
-- Run AFTER schema.sql
-- NOTE: owner_id is null here (for demo only).
--       In production, set it to a real user UUID.
-- ==============================================

insert into public.listings
  (title, location, description, price_per_hour, type, vehicle_type, lat, lng, available)
values
  (
    'Secure Covered Garage – Bandra',
    'Turner Road, Bandra West, Mumbai',
    'Safe underground parking in a gated complex. 24/7 security.',
    80, 'garage', 'both', 19.0596, 72.8295, true
  ),
  (
    'Open Lot near Andheri Station',
    'Andheri West, Mumbai',
    'Spacious open lot, ideal for long-duration parking.',
    40, 'lot', '4-wheeler', 19.1197, 72.8468, true
  ),
  (
    'Private Driveway – Powai',
    'Hiranandani Gardens, Powai, Mumbai',
    'Clean private driveway available on weekdays.',
    60, 'driveway', 'both', 19.1175, 72.9060, true
  ),
  (
    '2-Wheeler Bay – Dadar',
    'Dadar TT Circle, Dadar, Mumbai',
    'Dedicated 2-wheeler parking close to Dadar station.',
    20, 'lot', '2-wheeler', 19.0178, 72.8478, true
  ),
  (
    'Premium Garage – Lower Parel',
    'High Street Phoenix, Lower Parel, Mumbai',
    'Premium parking in a commercial buildings basement.',
    100, 'garage', '4-wheeler', 18.9927, 72.8295, true
  );
