import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AppInput from '@/components/AppInput';
import styles from './Onboarding.styles';
import { supabase } from '@/lib/utils/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

type Gender = 'male' | 'female' | 'other' | null;
type Goal = 'cut' | 'maintain' | 'bulk' | null;
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  name: string;
  age: string;
  height: string;
  weight: string;
  gender: Gender;
  goal: Goal;
  activityLevel: ActivityLevel;
}

// ─── Step configs ─────────────────────────────────────────────────────────────

const STEPS = ['Profile', 'Body', 'Goal', 'Activity'] as const;
type Step = typeof STEPS[number];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <View style={styles.stepRow}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[styles.stepDot, i <= current ? styles.stepDotActive : styles.stepDotInactive]}
      />
    ))}
  </View>
);

const SectionTitle: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
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
    {emoji ? (
      <Text style={[styles.chipEmoji, selected && styles.chipEmojiSelected]}>{emoji}</Text>
    ) : null}
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Steps ────────────────────────────────────────────────────────────────────

interface StepProfileProps {
  name: string;
  age: string;
  setName: (v: string) => void;
  setAge: (v: string) => void;
}

const StepProfile: React.FC<StepProfileProps> = ({ name, age, setName, setAge }) => (
  <View style={styles.stepContent}>
    <SectionTitle
      title="Let's get started 👋"
      subtitle="Tell us a bit about yourself."
    />
    <View style={styles.card}>
      <Text style={styles.label}>Full Name</Text>
      <AppInput
        size="large"
        placeholder="e.g. Alex Johnson"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <Text style={styles.label}>Age</Text>
      <AppInput
        size="large"
        placeholder="e.g. 25"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
    </View>
  </View>
);

interface StepBodyProps {
  height: string;
  weight: string;
  gender: Gender;
  setHeight: (v: string) => void;
  setWeight: (v: string) => void;
  setGender: (v: Gender) => void;
}

const GENDERS: { value: Gender; label: string; emoji: string }[] = [
  { value: 'male', label: 'Male', emoji: '♂️' },
  { value: 'female', label: 'Female', emoji: '♀️' },
  { value: 'other', label: 'Other', emoji: '⚧️' },
];

const StepBody: React.FC<StepBodyProps> = ({
  height,
  weight,
  gender,
  setHeight,
  setWeight,
  setGender,
}) => (
  <View style={styles.stepContent}>
    <SectionTitle
      title="Your Body 💪"
      subtitle="Used to calculate your daily macro targets."
    />
    <View style={styles.card}>
      <Text style={styles.label}>Height (cm)</Text>
      <AppInput
        size="large"
        placeholder="e.g. 178"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Weight (kg)</Text>
      <AppInput
        size="large"
        placeholder="e.g. 80"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />
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
    </View>
  </View>
);

interface StepGoalProps {
  goal: Goal;
  setGoal: (v: Goal) => void;
}

const GOALS: { value: Goal; label: string; emoji: string; description: string }[] = [
  {
    value: 'cut',
    label: 'Cut',
    emoji: '🔥',
    description: 'Lose fat while preserving muscle',
  },
  {
    value: 'maintain',
    label: 'Maintain',
    emoji: '⚖️',
    description: 'Keep your current weight & composition',
  },
  {
    value: 'bulk',
    label: 'Bulk',
    emoji: '🏋️',
    description: 'Build muscle with a caloric surplus',
  },
];

const StepGoal: React.FC<StepGoalProps> = ({ goal, setGoal }) => (
  <View style={styles.stepContent}>
    <SectionTitle
      title="What's your goal? 🎯"
      subtitle="We'll tailor your macro plan around this."
    />
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
            <Text style={[styles.goalLabel, goal === g.value && styles.goalLabelSelected]}>
              {g.label}
            </Text>
            <Text style={styles.goalDescription}>{g.description}</Text>
          </View>
          <View style={[styles.goalRadio, goal === g.value && styles.goalRadioSelected]} />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

interface StepActivityProps {
  activityLevel: ActivityLevel;
  setActivityLevel: (v: ActivityLevel) => void;
}

const ACTIVITY_LEVELS: {
  value: ActivityLevel;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    emoji: '🛋️',
    description: 'Little or no exercise',
  },
  {
    value: 'light',
    label: 'Lightly Active',
    emoji: '🚶',
    description: '1–3 days/week of light exercise',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    emoji: '🏃',
    description: '3–5 days/week of moderate exercise',
  },
  {
    value: 'active',
    label: 'Active',
    emoji: '⚡',
    description: '6–7 days/week of hard exercise',
  },
  {
    value: 'very_active',
    label: 'Very Active',
    emoji: '🔱',
    description: 'Athlete / physical job + daily training',
  },
];

const StepActivity: React.FC<StepActivityProps> = ({ activityLevel, setActivityLevel }) => (
  <View style={styles.stepContent}>
    <SectionTitle
      title="Activity Level 🏅"
      subtitle="How active are you on a typical week?"
    />
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
            <Text
              style={[styles.goalLabel, activityLevel === a.value && styles.goalLabelSelected]}
            >
              {a.label}
            </Text>
            <Text style={styles.goalDescription}>{a.description}</Text>
          </View>
          <View style={[styles.goalRadio, activityLevel === a.value && styles.goalRadioSelected]} />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(
  step: number,
  data: OnboardingData
): string | null {
  switch (step) {
    case 0:
      if (!data.name.trim()) return 'Please enter your name.';
      if (!data.age.trim() || isNaN(Number(data.age)) || Number(data.age) < 10 || Number(data.age) > 120)
        return 'Please enter a valid age.';
      return null;
    case 1:
      if (!data.height.trim() || isNaN(Number(data.height)) || Number(data.height) < 50)
        return 'Please enter a valid height in cm.';
      if (!data.weight.trim() || isNaN(Number(data.weight)) || Number(data.weight) < 20)
        return 'Please enter a valid weight in kg.';
      if (!data.gender) return 'Please select your gender.';
      return null;
    case 2:
      if (!data.goal) return 'Please select a goal.';
      return null;
    case 3:
      if (!data.activityLevel) return 'Please select your activity level.';
      return null;
    default:
      return null;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<Gender>(null);
  const [goal, setGoal] = useState<Goal>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(null);

  const data: OnboardingData = { name, age, height, weight, gender, goal, activityLevel };

  const handleNext = () => {
    const err = validateStep(step, data);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Step {step + 1} of {STEPS.length}
          </Text>
          <StepIndicator current={step} total={STEPS.length} />
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              try {
                await supabase.auth.signOut();
              } catch (err) {
                console.error('Error signing out', err);
              }
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Step content */}
        {step === 0 && (
          <StepProfile name={name} age={age} setName={setName} setAge={setAge} />
        )}
        {step === 1 && (
          <StepBody
            height={height}
            weight={weight}
            gender={gender}
            setHeight={setHeight}
            setWeight={setWeight}
            setGender={setGender}
          />
        )}
        {step === 2 && <StepGoal goal={goal} setGoal={setGoal} />}
        {step === 3 && (
          <StepActivity activityLevel={activityLevel} setActivityLevel={setActivityLevel} />
        )}

        {/* Error */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Navigation */}
        <View style={styles.navRow}>
          {step > 0 ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>
              {isLastStep ? 'Get Started 🚀' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

// Styles moved to ./Onboarding.styles.ts to follow project conventions

export default Onboarding;

