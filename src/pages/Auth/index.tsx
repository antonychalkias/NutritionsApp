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
import * as Google from 'expo-auth-session/providers/google';
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

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: 'YOUR_CLIENT_ID',
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            // TODO: Handle Google registration
            onAuthComplete?.();
        }
    }, [response]);

    const handleRegister = () => {
        // TODO: Implement registration logic and validation
        if (!name || !email || !password || !confirmPassword) {
            alert('Please fill all fields');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        onAuthComplete?.();
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
                            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                                <Text style={styles.buttonText}>Register</Text>
                            </TouchableOpacity>
                        </Brick>
                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <Text style={styles.orText}>OR</Text>
                            <View style={styles.divider} />
                        </View>
                        <View style={styles.bricksWithLogos}>
                            <Brick>
                                <TouchableOpacity style={styles.socialButton} onPress={() => promptAsync()} disabled={!request}>
                                    <Image source={GOOGLE_LOGO} style={styles.socialIcon} resizeMode="contain" />
                                </TouchableOpacity>
                            </Brick>
                            {Platform.OS === 'ios' && (
                                <Brick>
                                    <TouchableOpacity style={styles.socialButton} onPress={() => alert('Apple registration (stub)')}>
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


    const handleLogin = () => {
        // TODO: Implement login logic
        onAuthComplete?.();
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
                                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                                        <Text style={styles.buttonText}>Login</Text>
                                    </TouchableOpacity>
                                </Brick>
                                {/* TODO: Remove skip login before release */}
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
