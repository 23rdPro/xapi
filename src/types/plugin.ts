export interface Plugin {
  name: string;
  description?: string;
  setup?(config: any): Promise<void> | void;
  run?(config: any, spinner?: any): Promise<void> | void;
}
