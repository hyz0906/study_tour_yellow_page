-- Sample data for development and testing

-- Insert sample campsites
INSERT INTO public.campsites (name, url, country, category, description, thumbnail_url) VALUES
('Cambridge Summer School', 'https://www.cambridgeimmersion.com', 'UK', 'summer', 'A prestigious summer program at Cambridge University offering academic excellence and cultural immersion.', 'https://example.com/cambridge-thumb.jpg'),
('Swiss Alpine Adventure Camp', 'https://www.swissadventure.ch', 'Switzerland', 'winter', 'Winter sports and adventure activities in the beautiful Swiss Alps.', 'https://example.com/swiss-thumb.jpg'),
('Tokyo Tech Study Tour', 'https://www.tokyotech-study.jp', 'Japan', 'study', 'Technology and innovation focused study program in Tokyo.', 'https://example.com/tokyo-thumb.jpg'),
('Virtual Global Leadership', 'https://www.virtualleadership.com', 'Global', 'online', 'Online leadership development program with international participants.', 'https://example.com/virtual-thumb.jpg'),
('Barcelona Spanish Immersion', 'https://www.barcelonaimmersion.es', 'Spain', 'summer', 'Learn Spanish while exploring the vibrant culture of Barcelona.', 'https://example.com/barcelona-thumb.jpg');

-- Note: Sample users and other data would be inserted after user authentication is set up