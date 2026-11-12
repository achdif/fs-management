#import <React/RCTBridgeModule.h>
#import <RTNAuthSpec/RTNAuthSpec.h>
#import <LocalAuthentication/LocalAuthentication.h>

@interface RTNBiometricAuth : NativeBiometricAuthSpecBase <NativeBiometricAuthSpec>
@end

@implementation RTNBiometricAuth

RCT_EXPORT_MODULE(RTNBiometricAuth)

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeBiometricAuthSpecJSI>(params);
}

- (void)isAvailable:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
  LAContext *context = [[LAContext alloc] init];
  NSError *error = nil;

  if ([context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics
                           error:&error]) {
    NSString *type = @"none";
    if (@available(iOS 11.0, *)) {
      if (context.biometryType == LABiometryTypeFaceID) {
        type = @"faceid";
      } else if (context.biometryType == LABiometryTypeTouchID) {
        type = @"touchid";
      }
    }
    resolve(@{@"available": @YES, @"type": type});
  } else {
    resolve(@{@"available": @NO, @"type": @"none"});
  }
}

- (void)authenticate:(NSString *)reason
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
  LAContext *context = [[LAContext alloc] init];
  [context setLocalizedFallbackTitle:@"Use Passcode"];

  [context evaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics
          localizedReason:reason ?: @"Authenticate"
                    reply:^(BOOL success, NSError *error) {
    if (success) {
      resolve(@{@"success": @YES});
      return;
    }

    NSString *message = @"Authentication failed";
    if (error) {
      switch (error.code) {
        case kLAErrorUserCancel:
          message = @"User cancelled";
          break;
        case kLAErrorUserFallback:
          message = @"User chose passcode";
          break;
        case kLAErrorBiometryNotAvailable:
          message = @"Biometry not available";
          break;
        case kLAErrorBiometryNotEnrolled:
          message = @"Biometry not enrolled";
          break;
        case kLAErrorBiometryLockout:
          message = @"Biometry locked out";
          break;
        default:
          message = error.localizedDescription ?: message;
          break;
      }
    }
    resolve(@{@"success": @NO, @"error": message});
  }];
}

@end
