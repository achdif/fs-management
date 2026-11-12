#import <React/RCTBridgeModule.h>
#import <RTNAuthSpec/RTNAuthSpec.h>
#import <Security/Security.h>

@interface RTNSecureStorage : NativeSecureStorageSpecBase <NativeSecureStorageSpec>
@end

@implementation RTNSecureStorage

RCT_EXPORT_MODULE(RTNSecureStorage)

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeSecureStorageSpecJSI>(params);
}

- (void)setItem:(NSString *)key
          value:(NSString *)value
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject
{
  if (key.length == 0) {
    reject(@"E_SECURE_STORAGE", @"Key must not be empty", nil);
    return;
  }

  NSData *data = [value dataUsingEncoding:NSUTF8StringEncoding];
  NSDictionary *baseQuery = @{
    (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrAccount: key,
  };

  NSDictionary *addQuery = @{
    (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrAccount: key,
    (__bridge id)kSecValueData: data,
    (__bridge id)kSecAttrAccessible: (__bridge id)kSecAttrAccessibleWhenUnlocked,
  };

  OSStatus status = SecItemAdd((__bridge CFDictionaryRef)addQuery, NULL);
  if (status == errSecDuplicateItem) {
    NSDictionary *update = @{
      (__bridge id)kSecValueData: data,
    };
    status = SecItemUpdate((__bridge CFDictionaryRef)baseQuery,
                           (__bridge CFDictionaryRef)update);
  }

  if (status == errSecSuccess) {
    resolve(@YES);
  } else {
    reject(@"E_SECURE_STORAGE",
           [NSString stringWithFormat:@"Keychain write failed with status %d", (int)status],
           nil);
  }
}

- (void)getItem:(NSString *)key
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject
{
  NSDictionary *query = @{
    (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrAccount: key,
    (__bridge id)kSecReturnData: @YES,
    (__bridge id)kSecMatchLimit: (__bridge id)kSecMatchLimitOne,
  };

  CFTypeRef result = NULL;
  OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)query, &result);

  if (status == errSecItemNotFound) {
    resolve([NSNull null]);
    return;
  }

  if (status == errSecSuccess && result) {
    NSData *data = (__bridge_transfer NSData *)result;
    NSString *value = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    resolve(value ?: [NSNull null]);
    return;
  }

  reject(@"E_SECURE_STORAGE",
         [NSString stringWithFormat:@"Keychain read failed with status %d", (int)status],
         nil);
}

- (void)removeItem:(NSString *)key
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
  NSDictionary *query = @{
    (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrAccount: key,
  };

  OSStatus status = SecItemDelete((__bridge CFDictionaryRef)query);
  if (status == errSecSuccess || status == errSecItemNotFound) {
    resolve(@YES);
  } else {
    reject(@"E_SECURE_STORAGE",
           [NSString stringWithFormat:@"Keychain delete failed with status %d", (int)status],
           nil);
  }
}

- (void)clear:(RCTPromiseResolveBlock)resolve
      reject:(RCTPromiseRejectBlock)reject
{
  NSDictionary *query = @{
    (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
  };

  OSStatus status = SecItemDelete((__bridge CFDictionaryRef)query);
  if (status == errSecSuccess || status == errSecItemNotFound) {
    resolve(@YES);
  } else {
    reject(@"E_SECURE_STORAGE",
           [NSString stringWithFormat:@"Keychain clear failed with status %d", (int)status],
           nil);
  }
}

@end
