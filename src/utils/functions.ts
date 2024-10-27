export function joinExamples(examples: string[]): string {
  return examples
    .map((example) =>
      example
        .split("+")
        .map((line) => line.trim())
        .join("\n")
    )
    .join("\n\n");
}
