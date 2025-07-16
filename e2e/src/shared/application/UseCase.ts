/**
 * Base interface for all use cases following the Command/Query pattern
 */
export interface UseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

/**
 * Base interface for command use cases (operations that modify state)
 */
export type Command<TRequest, TResponse> = UseCase<TRequest, TResponse>;

/**
 * Base interface for query use cases (operations that read state)
 */
export type Query<TRequest, TResponse> = UseCase<TRequest, TResponse>;
