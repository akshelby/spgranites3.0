-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('review-photos', 'review-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('review-videos', 'review-videos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('carousel-images', 'carousel-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('estimation-files', 'estimation-files', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('catalog-files', 'catalog-files', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('banner-images', 'banner-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('testimonial-images', 'testimonial-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('category-images', 'category-images', true);

-- Storage policies for review-photos
CREATE POLICY "Anyone can view review photos" ON storage.objects FOR SELECT USING (bucket_id = 'review-photos');
CREATE POLICY "Authenticated users can upload review photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their review photos" ON storage.objects FOR DELETE USING (bucket_id = 'review-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for review-videos
CREATE POLICY "Anyone can view review videos" ON storage.objects FOR SELECT USING (bucket_id = 'review-videos');
CREATE POLICY "Authenticated users can upload review videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review-videos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their review videos" ON storage.objects FOR DELETE USING (bucket_id = 'review-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for profile-photos
CREATE POLICY "Anyone can view profile photos" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Users can upload their profile photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their profile photos" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their profile photos" ON storage.objects FOR DELETE USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for carousel-images (admin only)
CREATE POLICY "Anyone can view carousel images" ON storage.objects FOR SELECT USING (bucket_id = 'carousel-images');
CREATE POLICY "Admins can upload carousel images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'carousel-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update carousel images" ON storage.objects FOR UPDATE USING (bucket_id = 'carousel-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete carousel images" ON storage.objects FOR DELETE USING (bucket_id = 'carousel-images' AND has_role(auth.uid(), 'admin'));

-- Storage policies for estimation-files
CREATE POLICY "Anyone can view estimation files" ON storage.objects FOR SELECT USING (bucket_id = 'estimation-files');
CREATE POLICY "Anyone can upload estimation files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'estimation-files');
CREATE POLICY "Admins can delete estimation files" ON storage.objects FOR DELETE USING (bucket_id = 'estimation-files' AND has_role(auth.uid(), 'admin'));

-- Storage policies for product-images (admin only)
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

-- Storage policies for catalog-files (admin only)
CREATE POLICY "Anyone can view catalog files" ON storage.objects FOR SELECT USING (bucket_id = 'catalog-files');
CREATE POLICY "Admins can upload catalog files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'catalog-files' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update catalog files" ON storage.objects FOR UPDATE USING (bucket_id = 'catalog-files' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete catalog files" ON storage.objects FOR DELETE USING (bucket_id = 'catalog-files' AND has_role(auth.uid(), 'admin'));

-- Storage policies for service-images (admin only)
CREATE POLICY "Anyone can view service images" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
CREATE POLICY "Admins can upload service images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'service-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update service images" ON storage.objects FOR UPDATE USING (bucket_id = 'service-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete service images" ON storage.objects FOR DELETE USING (bucket_id = 'service-images' AND has_role(auth.uid(), 'admin'));

-- Storage policies for banner-images (admin only)
CREATE POLICY "Anyone can view banner images" ON storage.objects FOR SELECT USING (bucket_id = 'banner-images');
CREATE POLICY "Admins can upload banner images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banner-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update banner images" ON storage.objects FOR UPDATE USING (bucket_id = 'banner-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete banner images" ON storage.objects FOR DELETE USING (bucket_id = 'banner-images' AND has_role(auth.uid(), 'admin'));

-- Storage policies for testimonial-images (admin only)
CREATE POLICY "Anyone can view testimonial images" ON storage.objects FOR SELECT USING (bucket_id = 'testimonial-images');
CREATE POLICY "Admins can upload testimonial images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'testimonial-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update testimonial images" ON storage.objects FOR UPDATE USING (bucket_id = 'testimonial-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete testimonial images" ON storage.objects FOR DELETE USING (bucket_id = 'testimonial-images' AND has_role(auth.uid(), 'admin'));

-- Storage policies for category-images (admin only)
CREATE POLICY "Anyone can view category images" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');
CREATE POLICY "Admins can upload category images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'category-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update category images" ON storage.objects FOR UPDATE USING (bucket_id = 'category-images' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete category images" ON storage.objects FOR DELETE USING (bucket_id = 'category-images' AND has_role(auth.uid(), 'admin'));