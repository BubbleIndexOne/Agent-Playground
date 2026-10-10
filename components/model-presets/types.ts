export interface ModelPresetParams {
  temperature?: number;
  topP?: number;
  topK?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  maxOutputTokens?: number;
  seed?: number;
  stopSequences?: string[];
  reasoning?: string;
  toolChoice?: string;
}

export interface ModelPresetItem {
  id: string;
  owner_id: string;
  name: string;
  provider: string;
  model_id: string | null;
  params: ModelPresetParams;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateModelPresetInput {
  name: string;
  provider: string;
  model_id: string | null;
  params: ModelPresetParams;
}

export interface UpdateModelPresetInput {
  name?: string;
  provider?: string;
  model_id?: string | null;
  params?: ModelPresetParams;
  is_archived?: boolean;
}
