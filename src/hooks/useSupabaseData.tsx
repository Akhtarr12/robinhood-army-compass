
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Child {
  id: string;
  name: string;
  photo_url: string | null;
  mother_name: string;
  father_name: string;
  aadhaar_number: string;
  school_name: string | null;
  age_group: number;
  created_at: string;
  updated_at: string;
}

export interface Robin {
  id: string;
  name: string;
  photo_url: string | null;
  assigned_location: string;
  assigned_date: string;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface EducationalContent {
  id: string;
  age_group: number;
  subject: string;
  content_type: string;
  content: string;
  created_at: string;
}

export const useSupabaseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [robins, setRobins] = useState<Robin[]>([]);
  const [educationalContent, setEducationalContent] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch children data
  const fetchChildren = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching children:', error);
      toast({
        title: "Error",
        description: "Failed to fetch children data",
        variant: "destructive"
      });
    } else {
      setChildren(data || []);
    }
    setLoading(false);
  };

  // Fetch robins data
  const fetchRobins = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('robins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching robins:', error);
      toast({
        title: "Error", 
        description: "Failed to fetch robins data",
        variant: "destructive"
      });
    } else {
      setRobins(data || []);
    }
    setLoading(false);
  };

  // Fetch educational content
  const fetchEducationalContent = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('educational_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching educational content:', error);
    } else {
      setEducationalContent(data || []);
    }
  };

  // Add child
  const addChild = async (childData: Omit<Child, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('children')
      .insert([{ ...childData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error adding child:', error);
      return { error };
    }

    setChildren(prev => [data, ...prev]);
    return { data };
  };

  // Add robin
  const addRobin = async (robinData: Omit<Robin, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('robins')
      .insert([{ ...robinData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error adding robin:', error);
      return { error };
    }

    setRobins(prev => [data, ...prev]);
    return { data };
  };

  // Upload photo
  const uploadPhoto = async (file: File, folder: string) => {
    if (!user) return { error: 'Not authenticated' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      return { error: uploadError };
    }

    const { data } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    return { data: data.publicUrl };
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Children real-time subscription
    const childrenChannel = supabase
      .channel('children-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'children',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Children change received:', payload);
          fetchChildren();
        }
      )
      .subscribe();

    // Robins real-time subscription
    const robinsChannel = supabase
      .channel('robins-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'robins',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Robins change received:', payload);
          fetchRobins();
        }
      )
      .subscribe();

    // Educational content real-time subscription
    const contentChannel = supabase
      .channel('content-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'educational_content',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Educational content change received:', payload);
          fetchEducationalContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(childrenChannel);
      supabase.removeChannel(robinsChannel);
      supabase.removeChannel(contentChannel);
    };
  }, [user]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchChildren();
      fetchRobins();
      fetchEducationalContent();
    }
  }, [user]);

  return {
    children,
    robins,
    educationalContent,
    loading,
    addChild,
    addRobin,
    uploadPhoto,
    fetchChildren,
    fetchRobins,
    fetchEducationalContent
  };
};
