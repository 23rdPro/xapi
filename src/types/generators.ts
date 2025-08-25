export type TSGenOptions = {
  outputPath?: string; // if provided, write file to disk
  zod?: boolean;
  prefix?: string;
};

export interface ClientGenOptions {
  outputPath?: string;
  httpLibrary?: "fetch" | "axios" | "rtk" | "tanstack";
  baseUrl?: string;
}
