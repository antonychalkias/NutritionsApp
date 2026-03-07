import { supabase } from '@/lib/utils/supabase';

export interface ProfileUpsertData {
  display_name: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  target_weight_kg: number;
  gender: 'male' | 'female';
  fitness_goal: 'cut' | 'maintain' | 'bulk';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  unit_system: 'metric' | 'imperial';
  daily_calories: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fat_g: number;
  is_onboarded: boolean;
  last_active: string;
}

export async function upsertProfile(
  userId: string,
  data: ProfileUpsertData
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...data });
  return { error: error as Error | null };
}

export async function getProfileIsOnboarded(userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_onboarded')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Could not fetch profile, defaulting to onboarding:', error.message);
      return false;
    }

    return profile?.is_onboarded === true;
  } catch (err) {
    console.error('getProfileIsOnboarded error', err);
    return false;
  }
}