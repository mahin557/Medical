import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { PatientProvider } from '../context/PatientContext'
import { theme } from '../theme'

export default function RootLayout() {
  return (
    <PatientProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.card },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { fontWeight: '800', color: theme.colors.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index"    options={{ title: 'Patient & History', headerLeft: () => null }} />
        <Stack.Screen name="symptoms" options={{ title: 'Symptoms' }} />
        <Stack.Screen name="exam"     options={{ title: 'Exam & Labs' }} />
        <Stack.Screen name="results"  options={{ title: 'Diagnosis', headerLeft: () => null }} />
      </Stack>
    </PatientProvider>
  )
}
