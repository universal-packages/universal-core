import { CoreApp } from "@universal-packages/core";

export default class ExampleApp extends CoreApp {
  static appName = "example-app"; // Name your app so you have a closer relationship
  static description =
    "This app exemplify how the life cycle of a core app goes";
  static defaultConfig = {}

  timeout = 0;

  /**
   * OPTIONAL
   *
   * When core loads your app, it will call this method so you can prepare any custom
   * stuff you need to prepare in order for your app to run smoothly.
   *
   * Core modules are already loaded at this point so feel free to use them
   *
   * Or some times you just want custom stuff to happen before starting the app.
   *
   * Use the config passed to this instance via this App's configuration file as config
   *
   * this.config
   *
   * the configuration file should be named the same as your app's name
   * ./config/example-app.yaml | json | js | ts
   *
   * Also any params passed via command line will be passed to this instance
   * and can be accessed via:
   *
   * this.args
   *
   * ucore run example-app -p 80000
   *
   *
   * */
  async prepare() {
    // Be sure to handle any expected error
    // If this function throws an error the app will not initialize
  }

  /**
   * REQUIRED
   *
   * Once all modules have been loaded as well as your app prepared, this method
   * is called, here you can start listening for connections, or start a worker,
   * or any kind of whatever, after all, a core app is meant to be use in a universal
   * way.
   *
   * you can use the logger passed to this instance via:
   *
   * this.logger
   *
   * to log any kind of relevant log entries in your app
   *
   * */
  async run() {
    // Be sure to handle any expected error
    // If this function throws an error the app will not initialize
    this.timeout = setTimeout(() => {}, 999999999);
    core.logger.log({
      level: "INFO",
      title: "Example app has started",
      category: "APP",
      metadata: this.config,
    });
  }

  /**
   * REQUIRED
   *
   * After pressing CTRL+C Core App will call this method so you can start
   * shuting down your app gracefully, starting draining sockets or whatever.
   *
   * */
  async stop() {
    clearTimeout(this.timeout);
  }

  /**
   * OPTIONAL
   *
   * This is the contrapart of prepare use this after your app has stopped
   * to relase any resources or custom routines to ensure your app
   * has all setup to finish the process
   *
   * */
  async release() {}
}
