// UniversalAnalytics.cs
// Dan Polivy (dpolivy)

using System;
using GoogleAnalytics.Core;
using WPCordovaClassLib.Cordova;
using WPCordovaClassLib.Cordova.Commands;
using WPCordovaClassLib.Cordova.JSON;
using System.Collections.Generic;
using System.Windows;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.Phone.Shell;

namespace Cordova.Extension.Commands
{
    /// <summary>
    /// UniversalAnalytics plugin class containing methods called from JavaScript
    /// </summary>
    public class UniversalAnalytics : BaseCommand
    {
        private TrackerManager _trackerManager = new TrackerManager(new UniversalAnalyticsPlugin.PlatformInfoProvider());
        private Tracker _tracker;
        private bool _trackerStarted = false;
        DateTime? _suspended;
        private IDictionary<int, string> _customDimensions = new Dictionary<int, string>();

        public UniversalAnalytics()
	    {
            this.AutoAppLifetimeTracking = false;
            this.SessionTimeout = 30;
	    }

        /// <summary>
        /// Session timeout length, in seconds.
        /// </summary>
        public int? SessionTimeout {
            get;
            set;
        }

        /// <summary>
        /// Determines whether events are automatically sent for app lifetime tracking.
        /// </summary>
        public bool AutoAppLifetimeTracking { get; set; }

        public void startTrackerWithId(string options)
        {
            // If the tracker is already started, don't start it again
            if (_trackerStarted)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Tracker is already started"));
                return;
            }

            string[] args = JsonHelper.Deserialize<string[]>(options);

            if (!_trackerStarted && args.Length > 0 && args[0].Length > 0)
            {
                _tracker = _trackerManager.GetTracker(args[0]);

                // Set additional Tracker parameters here
                _tracker.SetStartSession(true);
                _tracker.IsUseSecure = true;
                _tracker.AppName = UniversalAnalyticsPlugin.Helpers.GetAppAttribute("Title");
                _tracker.AppVersion = UniversalAnalyticsPlugin.Helpers.GetAppAttribute("Version");

                _trackerStarted = true;

                Deployment.Current.Dispatcher.BeginInvoke(() =>
                    {
                        Application.Current.UnhandledException += Analytics_UnhandledException;
                        TaskScheduler.UnobservedTaskException += TaskScheduler_UnobservedTaskException;
                    });

                DispatchCommandResult(new PluginResult(PluginResult.Status.OK, "Tracker started"));
            }
            else
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Tracker id is not valid"));
            }
        }

        public override void OnResume(object sender, ActivatedEventArgs e)
        {
            if (_suspended.HasValue && SessionTimeout.HasValue)
            {
                var suspendedAgo = DateTime.UtcNow.Subtract(_suspended.Value);
                if (suspendedAgo > TimeSpan.FromSeconds((double)SessionTimeout))
                {
                    _tracker.SetStartSession(true);
                }
            }

            if (_trackerStarted && AutoAppLifetimeTracking)
            {
                _tracker.SendEvent("app", "resume", !e.IsApplicationInstancePreserved ? "tombstoned" : null, 0);
            }
        }

        public override void OnPause(object sender, DeactivatedEventArgs e)
        {
            if (_trackerStarted && AutoAppLifetimeTracking)
            {
                _tracker.SendEvent("app", "suspend", e.Reason.ToString(), 0);
            }

            _suspended = DateTime.UtcNow;
        }

        private void TaskScheduler_UnobservedTaskException(object sender, UnobservedTaskExceptionEventArgs e)
        {
            var ex = e.Exception.InnerException ?? e.Exception; // inner exception contains better info for unobserved tasks
            _tracker.SendException(ex.ToString(), false);
        }

        private void Analytics_UnhandledException(object sender, ApplicationUnhandledExceptionEventArgs e)
        {
            _tracker.SendException(e.ExceptionObject.ToString(), true);

            if (Debugger.IsAttached)
            {
                // An unhandled exception has occurred; break into the debugger
                Debugger.Break();
            }
        }

        public void setUserId(string options)
        {
            if (!_trackerStarted)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Tracker not started"));
                return;
            }

            // TODO:
            // Not Yet Implemented
            DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Not yet implemented"));
        }

        public void debugMode(string options)
        {          
            _trackerManager.IsDebugEnabled = true;

            DispatchCommandResult(new PluginResult(PluginResult.Status.OK, "debugMode enabled"));
        }

        public void trackView(string options)
        {
            if (!_trackerStarted)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Tracker not started"));
                return;
            }

            string[] args = JsonHelper.Deserialize<string[]>(options);

            if (args.Length > 0 && args[0].Length > 0)
            {                
                addCustomDimensionsToTracker(_tracker);
                _tracker.SendView(args[0]);
                DispatchCommandResult(new PluginResult(PluginResult.Status.OK, "Track Screen: " + args[0]));
            }
            else
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Expected one non-empty string argument"));
            }
        }

        public void addCustomDimension(string options)
        {
            string[] args = JsonHelper.Deserialize<string[]>(options);

            int index = 0;
            bool hasIndex = false;
            string value = null;

            if (args.Length > 0) hasIndex = int.TryParse(args[0], out index);
            if (args.Length > 1) value = args[1];

            if (hasIndex && value != null)
            {
                _customDimensions.Add(index, value);
            }
            else 
            {
               DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Expected non-empty integer, string arguments"));
            }
        }

        public void trackEvent(string options)
        {
            if (!_trackerStarted)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Tracker not started"));
                return;
            }

            string[] args = JsonHelper.Deserialize<string[]>(options);

            // Default values
            string category = null, action = null, label = null;
            long value = 0;

            if (args.Length > 0) category = args[0];
            if (args.Length > 1) action = args[1];
            if (args.Length > 2) label = args[2];
            if (args.Length > 3) long.TryParse(args[3], out value);

            addCustomDimensionsToTracker(_tracker);
            _tracker.SendEvent(category, action, label, value);

            DispatchCommandResult(new PluginResult(PluginResult.Status.OK, "Track Event: " + category));
        }

        public void addTransaction(string options)
        {
            if (!_trackerStarted)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Tracker not started"));
                return;
            }

            // TODO:
            // Not Yet Implemented
            DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Not yet implemented"));
        }

        public void addTransactionItem(string options)
        {
            if (!_trackerStarted)
            {
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Tracker not started"));
                return;
            }

            // TODO:
            // Not Yet Implemented
            DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, "Not yet implemented"));
        }

        private void addCustomDimensionsToTracker(Tracker tracker)
        {
            foreach (KeyValuePair<int, string> dimension in _customDimensions)
            {
                tracker.SetCustomDimension(dimension.Key, dimension.Value);
            }
        }
    }
}
