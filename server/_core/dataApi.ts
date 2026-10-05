// The generic Manus data proxy had no callers in the application.
// Add a named, direct provider integration when an actual feature needs one.
export type DataApiCallOptions = {
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  pathParams?: Record<string, unknown>;
  formData?: Record<string, unknown>;
};
export async function callDataApi(
  _apiId: string,
  _options: DataApiCallOptions = {}
): Promise<never> {
  throw new Error(
    "The retired data proxy is unavailable. Configure a direct provider for this feature."
  );
}
