-- Insert sample blog posts
INSERT INTO blogs (title, slug, excerpt, content, image_url, author_name, status, published_at) VALUES
(
  'Getting Started with Real Estate Investment',
  'getting-started-real-estate',
  'Learn the basics of real estate investment and how to get started with PeraVest.',
  'Real estate investment is one of the most reliable ways to build wealth. With PeraVest, you can start investing in premium properties with as little as ₦5,000. Our platform makes it easy for anyone to become a real estate investor, regardless of their financial background.',
  '/assets/img/blog/bloga.jpg',
  'PeraVest Team',
  'published',
  NOW()
),
(
  'The Power of Small Steps: Building Wealth',
  'power-of-small-steps',
  'When it comes to achieving big goals, we often get overwhelmed by the sheer size of the task.',
  'Building wealth doesn''t happen overnight. It''s about consistent small steps that compound over time. With PeraVest, you can start with just ₦5,000 and gradually build your real estate portfolio. Every investment, no matter how small, brings you closer to financial freedom.',
  '/assets/img/blog/blogb.jpg',
  'PeraVest Team',
  'published',
  NOW()
),
(
  'Understanding Property Investment Returns',
  'understanding-property-returns',
  'Learn how to calculate and maximize your returns from property investments.',
  'Property investment returns come from two main sources: rental income and capital appreciation. At PeraVest, we carefully select properties that offer both. Our investors typically see returns of 15-25% annually, making real estate one of the best investment options in Nigeria.',
  '/assets/img/blog/blogc.jpg',
  'PeraVest Team',
  'published',
  NOW()
);
