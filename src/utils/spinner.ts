import ora from "ora";

export async function withSpinner<T>(
  text: string,
  fn: () => Promise<T>
): Promise<T> {
  const spinner = ora({ text, color: "cyan" }).start();
  try {
    const res = await fn();
    spinner.succeed(`${text} ✓`);
    return res;
  } catch (err) {
    spinner.fail(`${text} ✖`);
    throw err;
  }
}
