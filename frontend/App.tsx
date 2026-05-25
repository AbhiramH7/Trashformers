import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <RootNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}
