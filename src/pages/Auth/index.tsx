import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Image,
    Platform,
} from 'react-native';
import AppInput from '@/components/AppInput';
import { useAuth } from '@/lib/auth/AuthProvider';
import styles from './Auth.styles';

const LOGO = require('@/assets/theron-logo-transparent.png');
const GOOGLE_LOGO = require('@/assets/google-logo.png');
const APPLE_LOGO = require('@/assets/apple-logo.png');

// ─── Registration Form ────────────────────────────────────────────────────────

interface RegistrationFormProps {
    onSwitchToLogin: () => void;
    onAuthComplete?: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSwitchToLogin, onAuthComplete }) => {
    const auth = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            alert('Please fill all fields');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            alert('Password must be at least 8 characters');
            return;
        }
        try {
            setLoading(true);
            const { data, error } = await auth.signUp(
                email.trim().toLowerCase(),
                password,
                { data: { full_name: name.trim() } }
            );
            if (error) { alert(error.message); return; }
            if (data && (data.session || data.user)) {
                onAuthComplete?.();
            } else {
                alert('Registration successful — please check your email to confirm your account before logging in.');
                onSwitchToLogin();
            }
        } catch (err) {
            console.error('Registration error', err);
            alert('An unexpected error occurred during registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.logoContainer}>
                    <Image source={LOGO} style={styles.logo} resizeMode="contain" />
                </View>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Register to start your fitness journey.</Text>
                </View>
                <View style={styles.form}>
                    <AppInput size="large" placeholder="Name" value={name} onChangeText={setName} />
                    <AppInput size="large" placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                    <AppInput size="large" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                    <AppInput size="large" placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
                </View>
                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
                </TouchableOpacity>
                <View style={styles.dividerRow}>
                    <View style={styles.divider} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.divider} />
                </View>
                <View style={styles.socialRow}>
                    <TouchableOpacity style={styles.socialButton} onPress={() => auth.signInWithOAuth('google')}>
                        <Image source={GOOGLE_LOGO} style={styles.socialIcon} resizeMode="contain" />
                    </TouchableOpacity>
                    {Platform.OS === 'ios' && (
                        <TouchableOpacity style={styles.socialButton} onPress={() => auth.signInWithOAuth('apple')}>
                            <Image source={APPLE_LOGO} style={styles.socialIcon} resizeMode="contain" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={onSwitchToLogin}>
                    <Text style={styles.switchText}>Already have an account? Login</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// ─── Auth (Login) ─────────────────────────────────────────────────────────────

interface AuthProps {
    onAuthComplete?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthComplete }) => {
    const auth = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isLogin) {
        return <RegistrationForm onSwitchToLogin={() => setIsLogin(true)} onAuthComplete={onAuthComplete} />;
    }

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }
        try {
            setLoading(true);
            const { data, error } = await auth.signInWithPassword(email.trim().toLowerCase(), password);
            if (error) { alert(error.message); return; }
            if (data?.session || data?.user) {
                onAuthComplete?.();
            } else {
                onAuthComplete?.();
            }
        } catch (err) {
            console.error('Login error', err);
            alert('An unexpected error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.logoContainer}>
                    <Image source={LOGO} style={styles.logo} resizeMode="contain" />
                </View>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Log in to track your macros.</Text>
                </View>
                <View style={styles.form}>
                    <AppInput size="large" placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                    <AppInput size="large" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                </View>
                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
                </TouchableOpacity>
                <View style={styles.dividerRow}>
                    <View style={styles.divider} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.divider} />
                </View>
                <View style={styles.socialRow}>
                    <TouchableOpacity style={styles.socialButton} onPress={() => auth.signInWithOAuth('google')}>
                        <Image source={GOOGLE_LOGO} style={styles.socialIcon} resizeMode="contain" />
                    </TouchableOpacity>
                    {Platform.OS === 'ios' && (
                        <TouchableOpacity style={styles.socialButton} onPress={() => auth.signInWithOAuth('apple')}>
                            <Image source={APPLE_LOGO} style={styles.socialIcon} resizeMode="contain" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={() => setIsLogin(false)}>
                    <Text style={styles.switchText}>Don't have an account? Register</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Auth;
