import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Image, Platform,
} from 'react-native';
import AppInput from '@/components/AppInput';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '@/lib/utils/supabase';
import styles from './Auth.styles';

// ─── Shared ───────────────────────────────────────────────────────────────────

const Brick: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
    <View style={[styles.brick, style]}>{children}</View>
);

// ─── Registration Form ────────────────────────────────────────────────────────

interface RegistrationFormProps {
    onSwitchToLogin: () => void;
    onAuthComplete?: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSwitchToLogin, onAuthComplete }) => {
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
            const { data, error } = await supabase.auth.signUp(
                {
                    email: email.trim().toLowerCase(),
                    password,
                    options: {
                        data: {
                            full_name: name.trim(),
                        },
                    },
                }
            );

            if (error) {
                // Supabase returns friendly messages for common issues (duplicate email, weak password)
                alert(error.message);
                return;
            }

            // If email confirmations are required, session may be null. Notify the user to verify email.
            if (data && (data.session || data.user)) {
                // If session exists, user is signed in immediately (depends on Supabase settings)
                onAuthComplete?.();
            } else {
                alert('Registration successful — please check your email to confirm your account before logging in.');
                // Optionally switch to login view so the user can attempt login after verification
                onSwitchToLogin();
            }
        } catch (err) {
            console.error('Registration error', err);
            alert('An unexpected error occurred during registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = async (provider: 'google' | 'apple') => {
        try {
            // Use Expo's redirect URI; for managed workflow proxy is often easiest
            const redirectTo = AuthSession.makeRedirectUri({ useProxy: true } as any);

            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo,
                },
            });

            if (error) {
                alert(error.message);
                return;
            }

            // Supabase will open the browser and handle the OAuth flow; after redirect the session will be restored.
        } catch (err) {
            console.error('OAuth error', err);
            alert('OAuth failed. Please try again.');
        }
    };

    const GOOGLE_LOGO = require('@/assets/google-logo.png');
    const APPLE_LOGO = require('@/assets/apple-logo.png');

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.rootInner}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Register to start your fitness journey.</Text>
                    <View style={styles.bricksContainer}>
                        <Brick>
                            <AppInput size="large" placeholder="Name" value={name} onChangeText={setName} />
                        </Brick>
                        <Brick>
                            <AppInput
                                size="large"
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </Brick>
                        <Brick>
                            <AppInput
                                size="large"
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </Brick>
                        <Brick>
                            <AppInput
                                size="large"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </Brick>
                        <Brick>
                            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                                <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
                            </TouchableOpacity>
                        </Brick>
                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <Text style={styles.orText}>OR</Text>
                            <View style={styles.divider} />
                        </View>
                        <View style={styles.bricksWithLogos}>
                            <Brick>
                                <TouchableOpacity style={styles.socialButton} onPress={() => handleOAuth('google')}>
                                    <Image source={GOOGLE_LOGO} style={styles.socialIcon} resizeMode="contain" />
                                </TouchableOpacity>
                            </Brick>
                            {Platform.OS === 'ios' && (
                                <Brick>
                                    <TouchableOpacity style={styles.socialButton} onPress={() => handleOAuth('apple')}>
                                        <Image source={APPLE_LOGO} style={styles.socialIcon} resizeMode="contain" />
                                    </TouchableOpacity>
                                </Brick>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity onPress={onSwitchToLogin}>
                        <Text style={styles.switchText}>Already have an account? Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// ─── Auth (Login) ─────────────────────────────────────────────────────────────

interface AuthProps {
    onAuthComplete?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthComplete }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);


    const handleLogin = async () => {
        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            });

            if (error) {
                alert(error.message);
                return;
            }

            if (data?.session || data?.user) {
                onAuthComplete?.();
            } else {
                alert('Login successful.');
                onAuthComplete?.();
            }
        } catch (err) {
            console.error('Login error', err);
            alert('An unexpected error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    const GOOGLE_LOGO = require('@/assets/google-logo.png');
    const APPLE_LOGO = require('@/assets/apple-logo.png');

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.rootInner}>
                    {isLogin ? (
                        <>
                            <Text style={styles.title}>Welcome Back</Text>
                            <Text style={styles.subtitle}>Log in to track your macros.</Text>
                            <View style={styles.bricksContainer}>
                                <Brick>
                                    <AppInput
                                        size="large"
                                        placeholder="Email"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </Brick>
                                <Brick>
                                    <AppInput
                                        size="large"
                                        placeholder="Password"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </Brick>
                                <Brick>
                                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                                        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
                                    </TouchableOpacity>
                                </Brick>
                                {/* temporary skip-login helper (keeps onboarding flow convenient during development) */}
                                <Brick>
                                    <TouchableOpacity style={styles.skipButton} onPress={() => onAuthComplete?.()}>
                                        <Text style={styles.skipText}>Skip for now</Text>
                                    </TouchableOpacity>
                                </Brick>
                                <View style={styles.dividerRow}>
                                    <View style={styles.divider} />
                                    <Text style={styles.orText}>OR</Text>
                                    <View style={styles.divider} />
                                </View>
                                <View style={styles.bricksWithLogos}>
                                    <Brick>
                                        <TouchableOpacity style={styles.socialButton} onPress={() => alert('Google login (stub)')}>
                                            <Image source={GOOGLE_LOGO} style={styles.socialIcon} resizeMode="contain" />
                                        </TouchableOpacity>
                                    </Brick>
                                    {Platform.OS === 'ios' && (
                                        <Brick>
                                            <TouchableOpacity style={styles.socialButton} onPress={() => alert('Apple login (stub)')}>
                                                <Image source={APPLE_LOGO} style={styles.socialIcon} resizeMode="contain" />
                                            </TouchableOpacity>
                                        </Brick>
                                    )}
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setIsLogin(false)}>
                                <Text style={styles.switchText}>Don't have an account? Register</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <RegistrationForm onSwitchToLogin={() => setIsLogin(true)} onAuthComplete={onAuthComplete} />
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

/* Styles moved to ./Auth.styles.ts to follow project conventions (component + styles file in same folder) */


export default Auth;
