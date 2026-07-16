export type PolicyBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean };

export type PolicyDocument = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  sections: PolicyBlock[];
};
