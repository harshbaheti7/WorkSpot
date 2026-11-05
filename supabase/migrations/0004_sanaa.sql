-- WorkSpot: add Sana’a Cafe branches (needs 0003 maps_url column first).
insert into cafes (id, name, neighborhood, address, maps_url, lat, lng, wifi, wifi_note, outlets, outlets_note, noise, noise_note, laptop, laptop_note, hours_note, summary, rating, price, user_note, source) values
('sanaa-new-montgomery', 'Sana’a Cafe (New Montgomery)', 'Financial District', '199 New Montgomery St', 'https://www.google.com/maps/search/?api=1&query=Sana%E2%80%99a+Cafe+%28New+Montgomery%29+199+New+Montgomery+St+San+Francisco+CA', 37.7865592, -122.3991101, 'yes', 'Free, password at counter', 'many', 'High tables', 2, 'Good for working', 'welcome', NULL, 'Mon–Fri 6:30AM–10PM, Sat–Sun 8AM–10PM', 'FiDi flagship of the Yemeni coffee chain with 20+ tables, bookable meeting rooms, and late hours. A serious work option — though Yelp flagged a temporary closure in late 2026, so verify before visiting.', NULL, NULL, NULL, 'guide'),
('sanaa-drumm', 'Sana’a Cafe (Drumm St)', 'Financial District', '27 Drumm St', 'https://www.google.com/maps/search/?api=1&query=Sana%E2%80%99a+Cafe+%28Drumm+St%29+27+Drumm+St+San+Francisco+CA', 37.7938614, -122.396537, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Opens 7AM; full hours unverified', 'The newest FiDi outpost for Yemeni coffee and pastries. Work details are still thin — hours and setup unverified.', NULL, NULL, NULL, 'guide');

insert into cafe_hours (cafe_id, weekday, opens_min, closes_min) values
('sanaa-new-montgomery', 0, 480, 1320),
('sanaa-new-montgomery', 1, 390, 1320),
('sanaa-new-montgomery', 2, 390, 1320),
('sanaa-new-montgomery', 3, 390, 1320),
('sanaa-new-montgomery', 4, 390, 1320),
('sanaa-new-montgomery', 5, 390, 1320),
('sanaa-new-montgomery', 6, 480, 1320);
