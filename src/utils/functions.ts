export function joinExamples(examples: string[]): string {
  return examples
    .map(
      (example) =>
        `<example>
      ${example
        .split("+")
        .map((line) => line.trim())
        .join("\n")}
          </example>`
    )
    .join("\n\n");
}
