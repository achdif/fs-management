#import <React/RCTBridgeModule.h>
#import <RTNAuthSpec/RTNAuthSpec.h>
#import <Network/Network.h>
#import <dispatch/dispatch.h>

@interface RTNNetworkMonitor : NativeNetworkMonitorSpecBase <NativeNetworkMonitorSpec>
@end

@implementation RTNNetworkMonitor {
  nw_path_monitor_t _monitor;
  dispatch_queue_t _monitorQueue;
  BOOL _isConnected;
  NSString *_connectionType;
}

RCT_EXPORT_MODULE(RTNNetworkMonitor)

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeNetworkMonitorSpecJSI>(params);
}

- (instancetype)init
{
  if (self = [super init]) {
    _monitorQueue = dispatch_queue_create("com.fsmanagement.networkmonitor", DISPATCH_QUEUE_SERIAL);
    _isConnected = NO;
    _connectionType = @"none";
  }
  return self;
}

- (void)getCurrentStatus:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject
{
  // Probe status path secara live — _isConnected hanya akurat jika
  // startListening sudah dipanggil, jadi jangan andalkan cache.
  // Dikerjakan di background queue agar tidak memblokir thread pemanggil.
  dispatch_async(dispatch_get_global_queue(QOS_CLASS_DEFAULT, 0), ^{
    nw_path_monitor_t probe = nw_path_monitor_create();
    nw_path_monitor_set_queue(probe, dispatch_get_global_queue(QOS_CLASS_DEFAULT, 0));

    dispatch_semaphore_t sem = dispatch_semaphore_create(0);
    __block BOOL connected = NO;
    __block NSString *type = @"none";

    nw_path_monitor_set_update_handler(probe, ^(nw_path_t path) {
      connected = nw_path_get_status(path) == nw_path_status_satisfied;
      type = @"none";
      if (connected) {
        if (nw_path_uses_interface_type(path, nw_interface_type_wifi)) {
          type = @"wifi";
        } else if (nw_path_uses_interface_type(path, nw_interface_type_cellular)) {
          type = @"cellular";
        } else if (nw_path_uses_interface_type(path, nw_interface_type_wired)) {
          type = @"ethernet";
        } else {
          type = @"other";
        }
      }
      dispatch_semaphore_signal(sem);
    });

    nw_path_monitor_start(probe);
    dispatch_semaphore_wait(sem, dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2 * NSEC_PER_SEC)));
    nw_path_monitor_cancel(probe);

    resolve(@{@"isConnected": @(connected), @"type": type ?: @"none"});
  });
}

- (void)startListening
{
  if (_monitor != NULL) {
    return;
  }

  _monitor = nw_path_monitor_create();
  nw_path_monitor_set_queue(_monitor, _monitorQueue);
  nw_path_monitor_set_update_handler(_monitor, ^(nw_path_t path) {
    BOOL connected = nw_path_get_status(path) == nw_path_status_satisfied;
    NSString *type = @"none";
    if (connected) {
      if (nw_path_uses_interface_type(path, nw_interface_type_wifi)) {
        type = @"wifi";
      } else if (nw_path_uses_interface_type(path, nw_interface_type_cellular)) {
        type = @"cellular";
      } else if (nw_path_uses_interface_type(path, nw_interface_type_wired)) {
        type = @"ethernet";
      } else {
        type = @"other";
      }
    }
    self->_isConnected = connected;
    self->_connectionType = type;
  });
  nw_path_monitor_start(_monitor);
}

- (void)stopListening
{
  if (_monitor != NULL) {
    nw_path_monitor_cancel(_monitor);
    nw_path_monitor_set_update_handler(_monitor, nil);
    _monitor = nil;
  }
}

- (void)invalidate
{
  [self stopListening];
}

@end
