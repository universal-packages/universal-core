import { CoreTask } from "@universal-packages/core";

interface ExampleTaskArgs {
  f: boolean;
  fast: boolean;
}

export default class ExampleTask extends CoreTask<ExampleTaskArgs> {
  public static readonly taskName = "example-task";
  public static readonly description =
    "Tasks are meant to ran, do their job and finish by themselves";

  /**
   * OPTIONAL
   *
   * Tasks load in the same way as an app, the prepare method is called
   * just after instantiation and after all modules are loaded to be
   * used here.
   *
   * */
  public async prepare(): Promise<void> {}

  /**
   * REQUIRED
   *
   * Once all is loaded and prepared
   *
   * The diference is that instead of loading a configuraration in the
   * options instance property the task executioner will pass a directive
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
  public async exec(): Promise<void> {}

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
  public async abort(): Promise<void> {}
}
