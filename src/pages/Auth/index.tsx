import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Image,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';
import { COLORS } from '@/constants/theme';
import AppInput from '@/components/AppInput';
import * as Google from 'expo-auth-session/providers/google';

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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        width: '100%',
        height: '100%',
    },
    safeRoot: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    rootInner: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.primary,
        fontFamily: 'Space Grotesk',
        marginBottom: 8,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.cardForeground,
        fontFamily: 'Inter',
        marginBottom: 24,
        textAlign: 'center',
    },
    button: {
        width: '100%',
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: COLORS.primaryForeground,
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Space Grotesk',
        letterSpacing: 0.5,
    },
    skipButton: {
        width: '100%',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    skipText: {
        color: COLORS.mutedForeground,
        fontSize: 14,
        fontFamily: 'Inter',
        letterSpacing: 0.3,
    },
    switchText: {
        color: COLORS.accent,
        fontSize: 15,
        fontFamily: 'Inter',
        marginTop: 8,
        textAlign: 'center',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
        width: '100%',
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    orText: {
        marginHorizontal: 8,
        color: COLORS.mutedForeground,
        fontSize: 13,
        fontFamily: 'Inter',
    },
    socialButton: {
        width: '100%',
        backgroundColor: COLORS.card,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 8,
        justifyContent: 'center',
    },
    socialIcon: {
        width: 32,
        height: 32,
    },
    bricksContainer: {
        width: '95%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bricksWithLogos: {
        flexDirection: 'row',
        width: '50%',
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brick: {
        width: '100%',
        backgroundColor: COLORS.card,
        borderRadius: 14,
        marginBottom: 14,
        padding: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
});

export default Auth;
