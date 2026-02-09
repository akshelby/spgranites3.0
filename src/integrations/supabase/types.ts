export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          admin_id: string | null
          admin_notes: string | null
          created_at: string
          id: string
          otp_verified_at: string | null
          processed_at: string | null
          reason: string | null
          status: string
          updated_at: string
          user_email: string | null
          user_id: string
          user_phone: string | null
        }
        Insert: {
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string
          id?: string
          otp_verified_at?: string | null
          processed_at?: string | null
          reason?: string | null
          status?: string
          updated_at?: string
          user_email?: string | null
          user_id: string
          user_phone?: string | null
        }
        Update: {
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string
          id?: string
          otp_verified_at?: string | null
          processed_at?: string | null
          reason?: string | null
          status?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string
          user_phone?: string | null
        }
        Relationships: []
      }
      addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          address_type: string | null
          city: string
          country: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          label: string | null
          phone: string
          pincode: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          address_type?: string | null
          city: string
          country?: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone: string
          pincode: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          address_type?: string | null
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone?: string
          pincode?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          button_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      catalogs: {
        Row: {
          created_at: string
          description: string | null
          download_count: number
          file_url: string
          id: string
          is_active: boolean
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_count?: number
          file_url: string
          id?: string
          is_active?: boolean
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          download_count?: number
          file_url?: string
          id?: string
          is_active?: boolean
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          ref_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          ref_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          ref_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_reviews: {
        Row: {
          area_name: string | null
          city: string | null
          created_at: string
          customer_name: string
          id: string
          is_approved: boolean
          photos: string[] | null
          pincode: string | null
          profile_photo_url: string | null
          rating: number
          review_text: string | null
          street: string | null
          updated_at: string
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          area_name?: string | null
          city?: string | null
          created_at?: string
          customer_name: string
          id?: string
          is_approved?: boolean
          photos?: string[] | null
          pincode?: string | null
          profile_photo_url?: string | null
          rating: number
          review_text?: string | null
          street?: string | null
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          area_name?: string | null
          city?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          is_approved?: boolean
          photos?: string[] | null
          pincode?: string | null
          profile_photo_url?: string | null
          rating?: number
          review_text?: string | null
          street?: string | null
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      estimation_enquiries: {
        Row: {
          additional_notes: string | null
          admin_notes: string | null
          approximate_length: string | null
          approximate_width: string | null
          assigned_to: string | null
          budget_range: string | null
          completion_urgency: string | null
          created_at: string
          cutouts_required: string[] | null
          drawing_data: string | null
          edge_profile_preference: string | null
          email: string | null
          estimated_amount: number | null
          expected_start_date: string | null
          finish_type: string | null
          flooring_required: boolean | null
          full_name: string
          id: string
          kitchen_type: string | null
          mobile_number: string
          number_of_counters: number | null
          preferred_color: string | null
          project_location: string | null
          project_nature: string | null
          project_type_other: string | null
          project_types: string[] | null
          quantity: string | null
          reference_images: string[] | null
          status: string
          stone_type: string | null
          thickness: string | null
          tile_size_preference: string | null
          total_flooring_area: string | null
          updated_at: string
          user_id: string | null
          voice_recording_url: string | null
          voice_transcription: string | null
        }
        Insert: {
          additional_notes?: string | null
          admin_notes?: string | null
          approximate_length?: string | null
          approximate_width?: string | null
          assigned_to?: string | null
          budget_range?: string | null
          completion_urgency?: string | null
          created_at?: string
          cutouts_required?: string[] | null
          drawing_data?: string | null
          edge_profile_preference?: string | null
          email?: string | null
          estimated_amount?: number | null
          expected_start_date?: string | null
          finish_type?: string | null
          flooring_required?: boolean | null
          full_name: string
          id?: string
          kitchen_type?: string | null
          mobile_number: string
          number_of_counters?: number | null
          preferred_color?: string | null
          project_location?: string | null
          project_nature?: string | null
          project_type_other?: string | null
          project_types?: string[] | null
          quantity?: string | null
          reference_images?: string[] | null
          status?: string
          stone_type?: string | null
          thickness?: string | null
          tile_size_preference?: string | null
          total_flooring_area?: string | null
          updated_at?: string
          user_id?: string | null
          voice_recording_url?: string | null
          voice_transcription?: string | null
        }
        Update: {
          additional_notes?: string | null
          admin_notes?: string | null
          approximate_length?: string | null
          approximate_width?: string | null
          assigned_to?: string | null
          budget_range?: string | null
          completion_urgency?: string | null
          created_at?: string
          cutouts_required?: string[] | null
          drawing_data?: string | null
          edge_profile_preference?: string | null
          email?: string | null
          estimated_amount?: number | null
          expected_start_date?: string | null
          finish_type?: string | null
          flooring_required?: boolean | null
          full_name?: string
          id?: string
          kitchen_type?: string | null
          mobile_number?: string
          number_of_counters?: number | null
          preferred_color?: string | null
          project_location?: string | null
          project_nature?: string | null
          project_type_other?: string | null
          project_types?: string[] | null
          quantity?: string | null
          reference_images?: string[] | null
          status?: string
          stone_type?: string | null
          thickness?: string | null
          tile_size_preference?: string | null
          total_flooring_area?: string | null
          updated_at?: string
          user_id?: string | null
          voice_recording_url?: string | null
          voice_transcription?: string | null
        }
        Relationships: []
      }
      estimation_form_fields: {
        Row: {
          created_at: string
          display_order: number
          field_key: string
          field_type: string
          id: string
          is_enabled: boolean
          is_required: boolean
          label: string
          options: Json | null
          section: string | null
          updated_at: string
          voice_input_enabled: boolean
        }
        Insert: {
          created_at?: string
          display_order?: number
          field_key: string
          field_type: string
          id?: string
          is_enabled?: boolean
          is_required?: boolean
          label: string
          options?: Json | null
          section?: string | null
          updated_at?: string
          voice_input_enabled?: boolean
        }
        Update: {
          created_at?: string
          display_order?: number
          field_key?: string
          field_type?: string
          id?: string
          is_enabled?: boolean
          is_required?: boolean
          label?: string
          options?: Json | null
          section?: string | null
          updated_at?: string
          voice_input_enabled?: boolean
        }
        Relationships: []
      }
      estimation_form_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      google_review_settings: {
        Row: {
          api_key: string | null
          created_at: string
          id: string
          is_enabled: boolean
          place_id: string | null
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          place_id?: string | null
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          place_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hero_carousel_cards: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_carousel_settings: {
        Row: {
          auto_rotate: boolean
          created_at: string
          id: string
          initial_visible_count: number
          rotation_speed: number
          scroll_sensitivity: number
          updated_at: string
        }
        Insert: {
          auto_rotate?: boolean
          created_at?: string
          id?: string
          initial_visible_count?: number
          rotation_speed?: number
          scroll_sensitivity?: number
          updated_at?: string
        }
        Update: {
          auto_rotate?: boolean
          created_at?: string
          id?: string
          initial_visible_count?: number
          rotation_speed?: number
          scroll_sensitivity?: number
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content_text: string | null
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          media_type: string | null
          media_url: string | null
          ref_id: string
          sender_name: string | null
          sender_type: string
        }
        Insert: {
          content_text?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          media_type?: string | null
          media_url?: string | null
          ref_id: string
          sender_name?: string | null
          sender_type: string
        }
        Update: {
          content_text?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          media_type?: string | null
          media_url?: string | null
          ref_id?: string
          sender_name?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          id: string
          notes: string | null
          order_number: string
          payment_id: string | null
          payment_status: string | null
          shipping_address: Json | null
          shipping_amount: number
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          id?: string
          notes?: string | null
          order_number: string
          payment_id?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_amount?: number
          status?: string
          subtotal: number
          tax_amount?: number
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_id?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_amount?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string
          email: string | null
          expires_at: string
          id: string
          phone: string | null
          purpose: string
          used: boolean
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          email?: string | null
          expires_at: string
          id?: string
          phone?: string | null
          purpose: string
          used?: boolean
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          phone?: string | null
          purpose?: string
          used?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean
          product_id: string
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          compare_price: number | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean
          is_featured: boolean
          name: string
          price: number
          short_description: string | null
          slug: string
          specifications: Json | null
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          compare_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          price: number
          short_description?: string | null
          slug: string
          specifications?: Json | null
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          compare_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price?: number
          short_description?: string | null
          slug?: string
          specifications?: Json | null
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          address_line_1: string | null
          address_line_2: string | null
          alternate_phone: string | null
          avatar_url: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          gst_number: string | null
          id: string
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          alternate_phone?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          gst_number?: string | null
          id?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          alternate_phone?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          gst_number?: string | null
          id?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          short_description: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          short_description?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          short_description?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_visitors: {
        Row: {
          city: string | null
          country: string | null
          id: string
          ip_address: string | null
          page_url: string | null
          referrer: string | null
          user_agent: string | null
          visited_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          id?: string
          ip_address?: string | null
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
          visited_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          id?: string
          ip_address?: string | null
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
          visited_at?: string
        }
        Relationships: []
      }
      store_locations: {
        Row: {
          address: string
          created_at: string
          display_order: number
          email: string | null
          google_maps_url: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          display_order?: number
          email?: string | null
          google_maps_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          display_order?: number
          email?: string | null
          google_maps_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          company: string | null
          created_at: string
          customer_name: string
          designation: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          rating: number
          review_text: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          customer_name: string
          designation?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          rating?: number
          review_text: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          customer_name?: string
          designation?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          rating?: number
          review_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_2fa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          email_verified: boolean
          id: string
          is_enabled: boolean
          phone_verified: boolean
          preferred_method: string | null
          secret_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          email_verified?: boolean
          id?: string
          is_enabled?: boolean
          phone_verified?: boolean
          preferred_method?: string | null
          secret_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          email_verified?: boolean
          id?: string
          is_enabled?: boolean
          phone_verified?: boolean
          preferred_method?: string | null
          secret_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      budget_range_enum:
        | "under_50k"
        | "50k_to_1l"
        | "1l_to_2l"
        | "2l_to_5l"
        | "above_5l"
        | "not_decided"
      enquiry_status:
        | "new"
        | "contacted"
        | "quoted"
        | "in_progress"
        | "completed"
        | "cancelled"
      finish_type_enum: "polished" | "honed" | "leather"
      kitchen_type: "straight" | "l_shape" | "u_shape" | "island"
      project_nature_type: "new_construction" | "renovation"
      stone_type_enum:
        | "granite"
        | "marble"
        | "quartz"
        | "porcelain"
        | "not_sure"
      thickness_option: "18mm" | "20mm" | "30mm"
      urgency_level: "flexible" | "within_1_month" | "within_2_weeks" | "urgent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      budget_range_enum: [
        "under_50k",
        "50k_to_1l",
        "1l_to_2l",
        "2l_to_5l",
        "above_5l",
        "not_decided",
      ],
      enquiry_status: [
        "new",
        "contacted",
        "quoted",
        "in_progress",
        "completed",
        "cancelled",
      ],
      finish_type_enum: ["polished", "honed", "leather"],
      kitchen_type: ["straight", "l_shape", "u_shape", "island"],
      project_nature_type: ["new_construction", "renovation"],
      stone_type_enum: ["granite", "marble", "quartz", "porcelain", "not_sure"],
      thickness_option: ["18mm", "20mm", "30mm"],
      urgency_level: ["flexible", "within_1_month", "within_2_weeks", "urgent"],
    },
  },
} as const
