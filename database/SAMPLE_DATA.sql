-- PERAVEST SAMPLE DATA INSERTION
-- Test data for all new tables

BEGIN;

-- Sample Target Savings
INSERT INTO public.target_savings ("user_id", "goal_name", "target_amount", "current_amount", "monthly_contribution", "target_date", "interest_rate", "status") VALUES
(1, 'House Down Payment', 5000000.00, 1200000.00, 200000.00, '2025-12-31', 12.00, 'active'),
(1, 'Emergency Fund', 1000000.00, 450000.00, 75000.00, '2024-12-31', 10.00, 'active'),
(2, 'Car Purchase', 3000000.00, 800000.00, 150000.00, '2025-06-30', 11.00, 'active');

-- Sample Ajo Groups
INSERT INTO public.ajo_groups ("name", "description", "contribution_amount", "frequency", "max_members", "current_members", "start_date", "end_date", "status", "created_by") VALUES
('Lagos Professionals Ajo', 'Monthly contribution group for working professionals', 50000.00, 'monthly', 12, 8, '2024-01-01', '2024-12-31', 'active', 1),
('Young Entrepreneurs Circle', 'Weekly savings for young business owners', 25000.00, 'weekly', 10, 6, '2024-02-01', '2024-12-31', 'open', 1),
('Family Savings Group', 'Monthly family-oriented savings group', 30000.00, 'monthly', 8, 4, '2024-03-01', '2025-02-28', 'open', 2);

-- Sample Ajo Memberships
INSERT INTO public.ajo_memberships ("group_id", "user_id", "position", "status", "total_contributed", "payout_received") VALUES
(1, 1, 1, 'active', 200000.00, false),
(1, 2, 2, 'active', 150000.00, false),
(2, 1, 1, 'active', 100000.00, false),
(3, 2, 1, 'active', 60000.00, false);

-- Sample Ajo Contributions
INSERT INTO public.ajo_contributions ("membership_id", "amount", "contribution_date", "status", "payment_reference") VALUES
(1, 50000.00, '2024-01-15', 'confirmed', 'AJO_001_202401'),
(1, 50000.00, '2024-02-15', 'confirmed', 'AJO_001_202402'),
(2, 50000.00, '2024-01-15', 'confirmed', 'AJO_002_202401'),
(3, 25000.00, '2024-02-05', 'confirmed', 'AJO_003_202402');

-- Sample User Investments
INSERT INTO public.user_investments ("user_id", "property_id", "investment_id", "amount_invested", "shares_owned", "status", "expected_return", "maturity_date") VALUES
(1, 1, 1, 100000.00, 20, 'active', 125000.00, '2025-12-31'),
(1, 2, 1, 50000.00, 10, 'active', 62500.00, '2025-06-30'),
(2, 1, 1, 75000.00, 15, 'active', 93750.00, '2025-12-31');

-- Sample Transactions
INSERT INTO public.transactions ("user_id", "transaction_type", "reference_id", "amount", "status", "payment_method", "payment_reference", "description") VALUES
(1, 'investment', 1, 100000.00, 'completed', 'paystack', 'PS_001_2024', 'Investment in Property ID 1'),
(1, 'target_saving', 1, 200000.00, 'completed', 'bank_transfer', 'BT_001_2024', 'Monthly contribution to House Down Payment'),
(2, 'investment', 2, 75000.00, 'completed', 'paystack', 'PS_002_2024', 'Investment in Property ID 1'),
(1, 'ajo_contribution', 1, 50000.00, 'completed', 'paystack', 'PS_003_2024', 'Ajo contribution - Lagos Professionals');

-- Sample Withdrawals
INSERT INTO public.withdrawals ("user_id", "amount", "bank_name", "account_number", "account_name", "status") VALUES
(1, 25000.00, 'First Bank', '1234567890', 'John Doe', 'pending'),
(2, 15000.00, 'GTBank', '0987654321', 'Jane Smith', 'approved');

-- Sample Savings Transactions
INSERT INTO public.savings_transactions ("savings_id", "transaction_type", "amount", "balance_before", "balance_after", "reference", "description") VALUES
(1, 'deposit', 200000.00, 1000000.00, 1200000.00, 'ST_001_2024', 'Monthly contribution'),
(1, 'interest', 12000.00, 1200000.00, 1212000.00, 'INT_001_2024', 'Monthly interest earned'),
(2, 'deposit', 75000.00, 375000.00, 450000.00, 'ST_002_2024', 'Monthly contribution');

-- Sample Notifications
INSERT INTO public.notifications ("user_id", "title", "message", "type", "action_url") VALUES
(1, 'Investment Successful', 'Your investment of ₦100,000 in Property XYZ has been confirmed', 'investment', '/portfolio'),
(1, 'Ajo Contribution Due', 'Your monthly Ajo contribution of ₦50,000 is due in 3 days', 'ajo', '/ajo/groups/1'),
(2, 'Withdrawal Approved', 'Your withdrawal request of ₦15,000 has been approved', 'withdrawal', '/withdrawals'),
(1, 'Target Savings Milestone', 'Congratulations! You have reached 24% of your House Down Payment goal', 'system', '/target-savings/1');

-- Sample User Profiles
INSERT INTO public.user_profiles ("user_id", "phone", "address", "city", "state", "occupation", "income_range", "investment_experience", "risk_tolerance", "kyc_status") VALUES
(1, '+2348012345678', '123 Victoria Island, Lagos', 'Lagos', 'Lagos State', 'Software Engineer', '500k-1M', 'Beginner', 'Moderate', 'verified'),
(2, '+2348087654321', '456 Wuse 2, Abuja', 'Abuja', 'FCT', 'Business Analyst', '300k-500k', 'Intermediate', 'Conservative', 'pending');

-- Sample Property Images
INSERT INTO public.property_images ("property_id", "image_url", "image_type", "alt_text", "sort_order") VALUES
(1, '/uploads/properties/prop1_main.jpg', 'main', 'Main view of luxury apartment', 1),
(1, '/uploads/properties/prop1_gallery1.jpg', 'gallery', 'Living room view', 2),
(1, '/uploads/properties/prop1_gallery2.jpg', 'gallery', 'Kitchen view', 3),
(2, '/uploads/properties/prop2_main.jpg', 'main', 'Executive duplex exterior', 1);

-- Sample Property Videos
INSERT INTO public.property_videos ("property_id", "video_url", "video_type", "title", "description", "duration") VALUES
(1, '/uploads/videos/prop1_tour.mp4', 'tour', 'Virtual Property Tour', 'Complete walkthrough of the luxury apartment', 180),
(2, '/uploads/videos/prop2_drone.mp4', 'drone', 'Aerial View', 'Drone footage of the executive duplex and surroundings', 120);

-- Sample User Sessions
INSERT INTO public.user_sessions ("user_id", "session_token", "ip_address", "user_agent", "expires_at") VALUES
(1, 'sess_token_123456789', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() + INTERVAL '7 days'),
(2, 'sess_token_987654321', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', NOW() + INTERVAL '7 days');

-- Sample Email Verifications
INSERT INTO public.email_verifications ("user_id", "email", "verification_token", "is_verified", "verified_at", "expires_at") VALUES
(1, 'john@example.com', 'verify_token_123', true, NOW() - INTERVAL '1 day', NOW() + INTERVAL '24 hours'),
(2, 'jane@example.com', 'verify_token_456', false, NULL, NOW() + INTERVAL '24 hours');

-- Sample Audit Logs
INSERT INTO public.audit_logs ("user_id", "action", "table_name", "record_id", "new_values", "ip_address") VALUES
(1, 'CREATE', 'user_investments', 1, '{"amount_invested": 100000, "property_id": 1}', '192.168.1.100'),
(1, 'UPDATE', 'target_savings', 1, '{"current_amount": 1200000}', '192.168.1.100'),
(2, 'CREATE', 'withdrawals', 1, '{"amount": 15000, "status": "pending"}', '192.168.1.101');

-- Sample Payment Logs
INSERT INTO public.payment_logs ("transaction_id", "gateway", "gateway_reference", "amount", "status", "gateway_response") VALUES
(1, 'paystack', 'PS_REF_001_2024', 100000.00, 'success', '{"status": "success", "reference": "PS_REF_001_2024", "amount": 10000000}'),
(2, 'paystack', 'PS_REF_002_2024', 200000.00, 'success', '{"status": "success", "reference": "PS_REF_002_2024", "amount": 20000000}'),
(3, 'paystack', 'PS_REF_003_2024', 75000.00, 'success', '{"status": "success", "reference": "PS_REF_003_2024", "amount": 7500000}');

COMMIT;