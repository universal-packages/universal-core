import { CoreTask } from "@universal-packages/core";

export default class ExampleTask extends CoreTask {
  static taskName = "example-task";
  static description =
    "Tasks are meant to ran, do their job and finish by themselves";
  static defaultConfig = {}

  /**
   * REQUIRED
   *
   * Once all is loaded and prepared
   *
   * The diference is that instead of loading a configuraration in the
   * config instance property the task executioner will pass a directive
   * and directiveOptions
   *
   * ucore exec example-task migrate users posts
   *                         |     | |         |
   *                         ------- -----------
   *                            |         |
   *                        directive    directiveOptions ['users', 'posts']
   *
   * these can be accessed as
   *
   * this.directive
   * this.directiveOptions
   *
   * And the same as apps the args property will be available via
   *
   * this.args
   *
   * */
  async exec() {}

  /**
   * OPTIONAL
   *
   * If you have a way to stop your task do it here
   * so the execution can be stoped gracefully.
   *
   * Example, if your exec method is just a loop you can set here a
   * this.stop = true property
   *
   * and in your loop
   *
   * for(...) {
   *   if(this.stop) return
   * }
   *
   * */
  async abort() {}
}
