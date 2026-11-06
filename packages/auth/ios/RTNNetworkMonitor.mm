#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <RTNAuthSpec/RTNAuthSpec.h>
#import <Network/Network.h>

@interface RTNNetworkMonitorSpec : RCTEventEmitter <NativeNetworkMonitorSpec>
@property (nonatomic, strong) nw_path_monitor_t pathMonitor;
@property (nonatomic, strong) nw_path_t lastPath;
@end

@implementation RTNNetworkMonitorSpec

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeNetworkMonitorSpecJSI>(params);
}

- (instancetype)init {
  if (self = [super init]) {
    _pathMonitor = nw_path_monitor_create();
    nw_path_monitor_set_queue(_pathMonitor, dispatch_get_global_queue(QOS_CLASS_DEFAULT, 0));
    nw_path_monitor_set_update_handler(_pathMonitor, ^(nw_path_t path) {
      [self handlePathUpdate:path];
    });
  }
  return self;
}

- (void)dealloc {
  if (_pathMonitor) {
    nw_path_monitor_cancel(_pathMonitor);
  }
}

- (void)handlePathUpdate:(nw_path_t)path {
  _lastPath = path;

  NSDictionary *status = [self statusFromPath:path];
  dispatch_async(dispatch_get_main_queue(), ^{
    [self sendEventWithName:@"networkStatusDidChange" body:status];
  });
}

- (NSDictionary *)statusFromPath:(nw_path_t)path {
  BOOL isConnected = nw_path_get_status(path) == nw_path_status_satisfied;
  NSString *type = @"none";

  if (isConnected) {
    __block NSString *detectedType = @"none";
    nw_path_enumerate_interfaces(path, ^bool(nw_interface_t interface) {
      switch (nw_interface_get_type(interface)) {
        case nw_interface_type_wifi:
          detectedType = @"wifi";
          return false;
        case nw_interface_type_cellular:
          detectedType = @"cellular";
          return false;
        case nw_interface_type_wired:
          detectedType = @"ethernet";
          return false;
        default:
          return true;
      }
    });
    type = detectedType;
  }

  return @{
    @"isConnected": @(isConnected),
    @"type": type
  };
}

- (NSDictionary *)getCurrentStatus {
  if (_lastPath) {
    return [self statusFromPath:_lastPath];
  }
  return @{
    @"isConnected": @NO,
    @"type": @"none"
  };
}

- (void)startMonitoring {
  if (_pathMonitor) {
    nw_path_monitor_start(_pathMonitor);
  }
}

- (void)stopMonitoring {
  if (_pathMonitor) {
    nw_path_monitor_cancel(_pathMonitor);
  }
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"networkStatusDidChange"];
}

@end
