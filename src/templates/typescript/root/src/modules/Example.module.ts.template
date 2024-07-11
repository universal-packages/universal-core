import { CoreModule } from "@universal-packages/core";

export default class ExampleModule extends CoreModule {
  public static readonly moduleName = "example-module";
  public static readonly description =
    "A module normally wrapps a thrid party module into being compatible with Core App";

  /**
   * REQUIRED
   *
   * Modules are loaded before the app or task are loaded, so they
   * can access all modules to prepare itself,
   *
   * Every time a module is loaded its prepare method will be callled
   * for instantiation, so all sort of preaprations can be made to leave
   * the module reary to be used accross the project
   *
   * configuration file for this module should be named the same as this module 'example-module'
   * in the config directory and accessed here with `this.config`
   *
   * ./src/config/example-module.yaml|js|json|ts
   *
   * And also a Logger object can be accessed via
   *
   * this.logger
   *
   * To publish any log entries
   *
   *
   * */
  public async prepare(): Promise<void> {}

  /**
   * REQUIRED
   *
   * Modules normaly will release any connections to local services
   * such as data bases, that can be done here.
   *
   * */
  public async release(): Promise<void> {}
}
