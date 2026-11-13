# SPM Manual Setup Instructions

Since the `react-native spm` CLI is not available, follow these manual steps in Xcode:

## Step 1: Remove CocoaPods References
- Open `FSMobile.xcodeproj` in Xcode
- Remove `libPods-FSMobile.a` from "Link Binary With Libraries" in Build Phases
- Delete the `Pods` folder and `.xcconfig` files

## Step 2: Add Swift Package Manager Dependencies

### Add React Native SPM Packages
In Xcode:
1. File → Add Package Dependencies
2. Add these packages one by one:

**React Native Core:**
- `https://github.com/facebook/react-native.git` (tag: 0.88.1)

**React Native Navigation Libraries:**
- `https://github.com/software-mansion/react-native-screens.git`
- `https://github.com/software-mansion/react-native-safe-area-context.git`
- `https://github.com/software-mansion/react-native-gesture-handler.git`
- `https://github.com/software-mansion/react-native-reanimated.git`

## Step 3: Configure Build Settings

For the FSMobile target:
1. Set "Swift Package Manager - Build Libraries" to "Static" for libraries that may have issues
2. Add header search paths if needed for Turbo Modules

## Step 4: Add Turbo Module Files

The Turbo Module implementations are in `packages/auth/ios/`:
- `RTNSecureStorage.mm`
- `RTNBiometricAuth.mm`
- `RTNNetworkMonitor.mm`

These need to be added to the Xcode project manually:
1. Right-click FSMobile → Add Files to "FSMobile"
2. Navigate to `packages/auth/ios/`
3. Add the `.mm` files
4. Ensure they're added to the FSMobile target

## Step 5: Run Codegen

Generate the Turbo Module spec headers:
```bash
cd apps/fsm-mobile
npx react-native codegen --path ios/generated --outputPath packages/auth/ios/generated
```

## Step 6: Build and Test

```bash
cd apps/fsm-mobile
npx react-native run-ios
```

## Notes

- The app currently has TypeScript/JSX configuration errors that need to be resolved in tsconfig.json
- Metro watchFolders is configured for monorepo support
- Info.plist has NSFaceIDUsageDescription for biometric auth
- PrivacyInfo.xcprivacy is added for Keychain access
