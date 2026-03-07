import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AppInput from '@/components/AppInput';
import styles from './Onboarding.styles';
import { supabase } from '@/lib/utils/supabase';
import { upsertProfile } from '@/lib/api/profiles';

// ─── Types ───────────────────────────────────────────────────────────────────

export type UnitSystem = 'metric' | 'imperial';
type Gender = 'male' | 'female' | null;
type Goal = 'cut' | 'maintain' | 'bulk' | null;
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;

type FieldErrors = {
  name?: string;
  age?: string;
  height?: string;
  weight?: string;
  targetWeight?: string;
  gender?: string;
  goal?: string;
  activityLevel?: string;
};

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  name: string;
  age: string;
  height: string;
  weight: string;
  targetWeight: string;
  gender: Gender;
  goal: Goal;
  activityLevel: ActivityLevel;
  unitSystem: UnitSystem;
}

// ─── Unit conversion helpers ─────────────────────────────────────────────────

const toMetric = {
  height: (v: number) => v * 2.54,        // in → cm
  weight: (v: number) => v / 2.2046,      // lbs → kg
};

// ─── Macro calculation ────────────────────────────────────────────────────────

const ACTIVITY_MULTIPLIERS: Record<NonNullable<ActivityLevel>, number> = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9,
};

function calculateTargets(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  goal: Goal,
  activityLevel: ActivityLevel,
) {
  const bmr =
    gender === 'female'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
      : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel!];
  let tdee = Math.round(bmr * multiplier);

  if (goal === 'cut')  tdee -= 500;
  if (goal === 'bulk') tdee += 350;

  const proteinPerKg = goal === 'maintain' ? 1.8 : 2.0;
  const proteinG = Math.round(weightKg * proteinPerKg);
  const fatG     = Math.round((tdee * 0.25) / 9);
  const carbsG   = Math.round((tdee - proteinG * 4 - fatG * 9) / 4);

  return { calories: tdee, proteinG, carbsG, fatG };
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(step: number, data: OnboardingData): FieldErrors {
  const errors: FieldErrors = {};
  const isImperial = data.unitSystem === 'imperial';

  switch (step) {
    case 0: {
      if (!data.name.trim())
        errors.name = 'Name is required.';
      const age = Number(data.age);
      if (!data.age.trim() || isNaN(age) || age < 10 || age > 120)
        errors.age = 'Enter a valid age between 10 and 120.';
      break;
    }
    case 1: {
      const h = Number(data.height);
      const w = Number(data.weight);
      const tw = Number(data.targetWeight);
      const [hMin, hMax] = isImperial ? [20, 110]  : [50, 280];
      const [wMin, wMax] = isImperial ? [44, 1100] : [20, 500];
      const hUnit = isImperial ? 'in' : 'cm';
      const wUnit = isImperial ? 'lbs' : 'kg';

      if (!data.height.trim() || isNaN(h) || h < hMin || h > hMax)
        errors.height = `Enter a valid height (${hMin}–${hMax} ${hUnit}).`;
      if (!data.weight.trim() || isNaN(w) || w < wMin || w > wMax)
        errors.weight = `Enter a valid weight (${wMin}–${wMax} ${wUnit}).`;
      if (!data.targetWeight.trim() || isNaN(tw) || tw < wMin || tw > wMax)
        errors.targetWeight = `Enter a valid target weight (${wMin}–${wMax} ${wUnit}).`;
      if (!data.gender)
        errors.gender = 'Please select your gender.';
      break;
    }
    case 2:
      if (!data.goal) errors.goal = 'Please select a goal.';
      break;
    case 3:
      if (!data.activityLevel) errors.activityLevel = 'Please select your activity level.';
      break;
  }

  return errors;
}

// ─── Step configs ─────────────────────────────────────────────────────────────

const STEPS = ['Profile', 'Body', 'Goal', 'Activity'] as const;

// ─── Shared sub-components ────────────────────────────────────────────────────

const StepIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <View style={styles.stepRow}>
    {Array.from({ length: total }).map((_, i) => (
      <View key={i} style={[styles.stepDot, i <= current ? styles.stepDotActive : styles.stepDotInactive]} />
    ))}
  </View>
);

const SectionTitle: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <Text style={styles.fieldError}>{message}</Text> : null;

const UnitToggle: React.FC<{ value: UnitSystem; onChange: (v: UnitSystem) => void }> = ({ value, onChange }) => (
  <View style={styles.unitToggleRow}>
    <TouchableOpacity
      style={[styles.unitToggleBtn, value === 'metric' && styles.unitToggleBtnActive]}
      onPress={() => onChange('metric')}
      activeOpacity={0.7}
    >
      <Text style={[styles.unitToggleText, value === 'metric' && styles.unitToggleTextActive]}>Metric</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.unitToggleBtn, value === 'imperial' && styles.unitToggleBtnActive]}
      onPress={() => onChange('imperial')}
      activeOpacity={0.7}
    >
      <Text style={[styles.unitToggleText, value === 'imperial' && styles.unitToggleTextActive]}>Imperial</Text>
    </TouchableOpacity>
  </View>
);

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  emoji?: string;
}

const Chip: React.FC<ChipProps> = ({ label, selected, onPress, emoji }) => (
  <TouchableOpacity
    style={[styles.chip, selected && styles.chipSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {emoji ? <Text style={styles.chipEmoji}>{emoji}</Text> : null}
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Steps ────────────────────────────────────────────────────────────────────

interface StepProfileProps {
  name: string;
  age: string;
  errors: FieldErrors;
  setName: (v: string) => void;
  setAge: (v: string) => void;
}

const StepProfile: React.FC<StepProfileProps> = ({ name, age, errors, setName, setAge }) => (
  <View style={styles.stepContent}>
    <SectionTitle title="Let's get started 👋" subtitle="Tell us a bit about yourself." />
    <View style={styles.card}>
      <Text style={styles.label}>Full Name</Text>
      <AppInput
        size="large"
        placeholder="e.g. Alex Johnson"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        style={errors.name ? styles.inputError : undefined}
      />
      <FieldError message={errors.name} />

      <Text style={styles.label}>Age</Text>
      <AppInput
        size="large"
        placeholder="e.g. 25"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={errors.age ? styles.inputError : undefined}
      />
      <FieldError message={errors.age} />
    </View>
  </View>
);

interface StepBodyProps {
  height: string;
  weight: string;
  targetWeight: string;
  gender: Gender;
  unitSystem: UnitSystem;
  errors: FieldErrors;
  setHeight: (v: string) => void;
  setWeight: (v: string) => void;
  setTargetWeight: (v: string) => void;
  setGender: (v: Gender) => void;
  setUnitSystem: (v: UnitSystem) => void;
}

const GENDERS: { value: Gender; label: string; emoji: string }[] = [
  { value: 'male',   label: 'Male',   emoji: '♂️' },
  { value: 'female', label: 'Female', emoji: '♀️' },
];

const StepBody: React.FC<StepBodyProps> = ({
  height, weight, targetWeight, gender, unitSystem, errors,
  setHeight, setWeight, setTargetWeight, setGender, setUnitSystem,
}) => {
  const isImperial = unitSystem === 'imperial';
  const hLabel  = isImperial ? 'Height (in)' : 'Height (cm)';
  const wLabel  = isImperial ? 'Current Weight (lbs)' : 'Current Weight (kg)';
  const twLabel = isImperial ? 'Target Weight (lbs)'  : 'Target Weight (kg)';
  const hHint   = isImperial ? 'e.g. 70' : 'e.g. 178';
  const wHint   = isImperial ? 'e.g. 176' : 'e.g. 80';
  const twHint  = isImperial ? 'e.g. 165' : 'e.g. 75';

  return (
    <View style={styles.stepContent}>
      <SectionTitle title="Your Body 💪" subtitle="Used to calculate your daily macro targets." />
      <View style={styles.card}>
        <UnitToggle value={unitSystem} onChange={setUnitSystem} />

        <Text style={styles.label}>{hLabel}</Text>
        <AppInput
          size="large"
          placeholder={hHint}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          style={errors.height ? styles.inputError : undefined}
        />
        <FieldError message={errors.height} />

        <Text style={styles.label}>{wLabel}</Text>
        <AppInput
          size="large"
          placeholder={wHint}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          style={errors.weight ? styles.inputError : undefined}
        />
        <FieldError message={errors.weight} />

        <Text style={styles.label}>{twLabel}</Text>
        <AppInput
          size="large"
          placeholder={twHint}
          value={targetWeight}
          onChangeText={setTargetWeight}
          keyboardType="numeric"
          style={errors.targetWeight ? styles.inputError : undefined}
        />
        <FieldError message={errors.targetWeight} />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.chipRow}>
          {GENDERS.map((g) => (
            <Chip
              key={g.value}
              label={g.label}
              emoji={g.emoji}
              selected={gender === g.value}
              onPress={() => setGender(g.value)}
            />
          ))}
        </View>
        <FieldError message={errors.gender} />
      </View>
    </View>
  );
};

interface StepGoalProps {
  goal: Goal;
  error?: string;
  setGoal: (v: Goal) => void;
}

const GOALS: { value: Goal; label: string; emoji: string; description: string }[] = [
  { value: 'cut',      label: 'Cut',      emoji: '🔥', description: 'Lose fat while preserving muscle' },
  { value: 'maintain', label: 'Maintain', emoji: '⚖️', description: 'Keep your current weight & composition' },
  { value: 'bulk',     label: 'Bulk',     emoji: '🏋️', description: 'Build muscle with a caloric surplus' },
];

const StepGoal: React.FC<StepGoalProps> = ({ goal, error, setGoal }) => (
  <View style={styles.stepContent}>
    <SectionTitle title="What's your goal? 🎯" subtitle="We'll tailor your macro plan around this." />
    <View style={styles.goalColumn}>
      {GOALS.map((g) => (
        <TouchableOpacity
          key={g.value}
          style={[styles.goalCard, goal === g.value && styles.goalCardSelected]}
          onPress={() => setGoal(g.value)}
          activeOpacity={0.8}
        >
          <Text style={[styles.goalEmoji, goal === g.value && styles.goalEmojiSelected]}>{g.emoji}</Text>
          <View style={styles.goalTextBlock}>
            <Text style={[styles.goalLabel, goal === g.value && styles.goalLabelSelected]}>{g.label}</Text>
            <Text style={styles.goalDescription}>{g.description}</Text>
          </View>
          <View style={[styles.goalRadio, goal === g.value && styles.goalRadioSelected]} />
        </TouchableOpacity>
      ))}
    </View>
    <FieldError message={error} />
  </View>
);

interface StepActivityProps {
  activityLevel: ActivityLevel;
  error?: string;
  setActivityLevel: (v: ActivityLevel) => void;
}

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; emoji: string; description: string }[] = [
  { value: 'sedentary',  label: 'Sedentary',     emoji: '🛋️', description: 'Little or no exercise' },
  { value: 'light',      label: 'Lightly Active', emoji: '🚶', description: '1–3 days/week of light exercise' },
  { value: 'moderate',   label: 'Moderate',       emoji: '🏃', description: '3–5 days/week of moderate exercise' },
  { value: 'active',     label: 'Active',          emoji: '⚡', description: '6–7 days/week of hard exercise' },
  { value: 'very_active', label: 'Very Active',   emoji: '🔱', description: 'Athlete / physical job + daily training' },
];

const StepActivity: React.FC<StepActivityProps> = ({ activityLevel, error, setActivityLevel }) => (
  <View style={styles.stepContent}>
    <SectionTitle title="Activity Level 🏅" subtitle="How active are you on a typical week?" />
    <View style={styles.goalColumn}>
      {ACTIVITY_LEVELS.map((a) => (
        <TouchableOpacity
          key={a.value}
          style={[styles.goalCard, activityLevel === a.value && styles.goalCardSelected]}
          onPress={() => setActivityLevel(a.value)}
          activeOpacity={0.8}
        >
          <Text style={[styles.goalEmoji, activityLevel === a.value && styles.goalEmojiSelected]}>{a.emoji}</Text>
          <View style={styles.goalTextBlock}>
            <Text style={[styles.goalLabel, activityLevel === a.value && styles.goalLabelSelected]}>{a.label}</Text>
            <Text style={styles.goalDescription}>{a.description}</Text>
          </View>
          <View style={[styles.goalRadio, activityLevel === a.value && styles.goalRadioSelected]} />
        </TouchableOpacity>
      ))}
    </View>
    <FieldError message={error} />
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep]       = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving]   = useState(false);

  const [name, setName]                   = useState('');
  const [age, setAge]                     = useState('');
  const [height, setHeight]               = useState('');
  const [weight, setWeight]               = useState('');
  const [targetWeight, setTargetWeight]   = useState('');
  const [gender, setGender]               = useState<Gender>(null);
  const [goal, setGoal]                   = useState<Goal>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(null);
  const [unitSystem, setUnitSystem]       = useState<UnitSystem>('metric');

  const data: OnboardingData = {
    name, age, height, weight, targetWeight, gender, goal, activityLevel, unitSystem,
  };

  const handleNext = async () => {
    const errors = validateStep(step, data);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    // Last step — convert units and save to Supabase
    setSaving(true);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error('No authenticated user found.');

      const isImperial  = unitSystem === 'imperial';
      const heightCm    = isImperial ? toMetric.height(parseFloat(height))       : parseFloat(height);
      const weightKg    = isImperial ? toMetric.weight(parseFloat(weight))       : parseFloat(weight);
      const targetWtKg  = isImperial ? toMetric.weight(parseFloat(targetWeight)) : parseFloat(targetWeight);

      const targets = calculateTargets(weightKg, heightCm, parseInt(age, 10), gender, goal, activityLevel);

      const { error: upsertErr } = await upsertProfile(user.id, {
        display_name:     name.trim(),
        age:              parseInt(age, 10),
        height_cm:        Math.round(heightCm * 10) / 10,
        weight_kg:        Math.round(weightKg * 100) / 100,
        target_weight_kg: Math.round(targetWtKg * 100) / 100,
        gender:           gender!,
        fitness_goal:     goal!,
        activity_level:   activityLevel!,
        unit_system:      unitSystem,
        daily_calories:   targets.calories,
        daily_protein_g:  targets.proteinG,
        daily_carbs_g:    targets.carbsG,
        daily_fat_g:      targets.fatG,
        is_onboarded:     true,
        last_active:      new Date().toISOString(),
      });

      if (upsertErr) throw upsertErr;
      onComplete(data);
    } catch (e: any) {
      setFieldErrors({ name: e?.message ?? 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setFieldErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>Step {step + 1} of {STEPS.length}</Text>
          <StepIndicator current={step} total={STEPS.length} />
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => { try { await supabase.auth.signOut(); } catch (err) { console.error(err); } }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {step === 0 && (
          <StepProfile name={name} age={age} errors={fieldErrors} setName={setName} setAge={setAge} />
        )}
        {step === 1 && (
          <StepBody
            height={height} weight={weight} targetWeight={targetWeight}
            gender={gender} unitSystem={unitSystem} errors={fieldErrors}
            setHeight={setHeight} setWeight={setWeight} setTargetWeight={setTargetWeight}
            setGender={setGender} setUnitSystem={setUnitSystem}
          />
        )}
        {step === 2 && <StepGoal goal={goal} error={fieldErrors.goal} setGoal={setGoal} />}
        {step === 3 && <StepActivity activityLevel={activityLevel} error={fieldErrors.activityLevel} setActivityLevel={setActivityLevel} />}

        {/* Navigation */}
        <View style={styles.navRow}>
          {step > 0 ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7} disabled={saving}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.nextButtonText}>{isLastStep ? 'Get Started 🚀' : 'Next →'}</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Onboarding;
