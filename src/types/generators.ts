export type TSGenOptions = {
  outputPath?: string; // if provided, write file to disk
  zod?: boolean;
  prefix?: string;
};
export interface ClientGenOptions {
  outputPath?: string;
  httpLibrary?: "fetch" | "axios" | "rtk" | "tanstack";
  baseUrl?: string;
  outDir?: string;
  zod?: boolean;
  wsUrl?: string;
  prefix?: string;
}

export interface GenOptions {
  outputPath?: string;
  zod?: boolean;
  prefix?: string;
  baseUrl?: string;
  wsUrl?: string;
  httpLibrary?: "fetch" | "axios" | "rtk" | "tanstack";
}
