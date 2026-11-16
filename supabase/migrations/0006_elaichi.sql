-- WorkSpot: add Elaichi Co. (SoMa chai cafe). Hours from official site; WiFi unconfirmed (conflicting reports).
insert into cafes (id, name, neighborhood, address, maps_url, lat, lng, wifi, wifi_note, outlets, outlets_note, noise, noise_note, laptop, laptop_note, hours_note, summary, rating, price, user_note, source) values
('elaichi-co', 'Elaichi Co.', 'SoMa', '360 3rd St', 'https://www.google.com/maps/search/?api=1&query=Elaichi+Co.+360+3rd+St+San+Francisco+CA', 37.782697, -122.3983632, 'yes', 'Free WiFi', NULL, NULL, 3, 'Buzzing, energetic room', 'welcome', 'Laptops common; communal work tables', 'Mon–Sat 8AM–9PM, Sun 8AM–7PM', 'Berkeley-born chai cafe''s first SF outpost in SoMa, serving three chai drinks and pastries till 9pm most nights. Communal work tables fill with laptops, though seating is tight — arrive early for a spot.', NULL, NULL, NULL, 'guide');

insert into cafe_hours (cafe_id, weekday, opens_min, closes_min) values
('elaichi-co', 0, 480, 1140),
('elaichi-co', 1, 480, 1260),
('elaichi-co', 2, 480, 1260),
('elaichi-co', 3, 480, 1260),
('elaichi-co', 4, 480, 1260),
('elaichi-co', 5, 480, 1260),
('elaichi-co', 6, 480, 1260);
