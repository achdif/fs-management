#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <RTNAuthSpec/RTNAuthSpec.h>
#import <LocalAuthentication/LocalAuthentication.h>

@interface RTNBiometricAuthSpec : NSObject <NativeBiometricAuthSpec>
@end

@implementation RTNBiometricAuthSpec

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeBiometricAuthSpecJSI>(params);
}

- (NSDictionary *)checkAvailability
{
  LAContext *context = [[LAContext alloc] init];
  NSError *error = nil;
  
  if ([context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:&error]) {
    NSString *type = @"none";
    if (@available(iOS 11.0, *)) {
      if (context.biometryType == LABiometryTypeFaceID) {
        type = @"faceid";
      } else if (context.biometryType == LABiometryTypeTouchID) {
        type = @"touchid";
      }
    }
    return @{
      @"available": @YES,
      @"type": type
    };
  }
  
  return @{
    @"available": @NO,
    @"type": @"none"
  };
}

- (NSDictionary *)authenticate:(NSString *)reason
{
  LAContext *context = [[LAContext alloc] init];
  __block NSError *error = nil;
  
  [context setLocalizedFallbackTitle:@"Use Passcode"];
  
  LAPolicy policy = LAPolicyDeviceOwnerAuthenticationWithBiometrics;
  
  __block BOOL success = NO;
  dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
  
  [context evaluatePolicy:policy
          localizedReason:reason
                    reply:^(BOOL didSucceed, NSError *authError) {
    success = didSucceed;
    error = authError;
    dispatch_semaphore_signal(semaphore);
  }];
  
  dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
  
  if (success) {
    return @{
      @"success": @YES
    };
  }
  
  NSString *errorMessage = @"Authentication failed";
  if (error) {
    switch (error.code) {
      case kLAErrorUserCancel:
        errorMessage = @"User cancelled";
        break;
      case kLAErrorUserFallback:
        errorMessage = @"User chose password";
        break;
      case kLAErrorSystemCancel:
        errorMessage = @"System cancelled";
        break;
      case kLAErrorPasscodeNotSet:
        errorMessage = @"No passcode set";
        break;
      case kLAErrorBiometryNotAvailable:
        errorMessage = @"Biometry not available";
        break;
      case kLAErrorBiometryNotEnrolled:
        errorMessage = @"Biometry not enrolled";
        break;
      case kLAErrorBiometryLockout:
        errorMessage = @"Biometry locked out";
        break;
      default:
        errorMessage = error.localizedDescription;
        break;
    }
  }
  
  return @{
    @"success": @NO,
    @"error": errorMessage
  };
}

@end
