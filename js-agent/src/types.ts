
export interface Reflections {
  /**
   * Style rules to follow for generating content.
   */
  styleRules: string[];
  /**
   * Key content to remember about the user when generating content.
   */
  content: string[];
}

export interface Artifact {
  id: string;
  content: string;
  title: string;
  type: "code" | "text";
  language: string;
}